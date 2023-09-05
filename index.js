const { Telegraf, Scenes, session, Markup } = require("telegraf");
const fs = require("fs");
const bot = new Telegraf("6585859940:AAFNICDaPXDicVKe2iI9fccQ0mYSLhuOyk4");
const path = require("path");
const puppeteer = require("puppeteer");

const questions = {
  1: "Фамилия, исм-шарифингиз?",
  2: "Тугилган санангиз?",
  3: "Яшаш манзилингиз?",
  4: "Телефон ракамингиз",
  5: "Оилавий аxволи (турмуш курган, турмуш курмаган)?",
  6: "Қайси компьютер дастурарида ишлагансиз?",
  7: "Охирги иш жойингиз хакида маълумот берсангиз?",
  8: "Бизда канча микдорли маошга ишламокчисиз (ёзишингиз шарт)",
  9: "Кайси йуналишда (оддий ходим, сотув, бошкарув, слесарь, сварщик, бухгалтерия) бемалол кийналмай ишлай оласиз?",
  10: "Бизнинг корхонада канча муддат ишламокчисиз?",
  11: "Узингиз хакингизда нималар кушмокчисиз?",
};

const channelChatId = "-1001929825010";

const userAnswers = {};

const formScene = new Scenes.BaseScene("formScene");

formScene.enter((ctx) => {
  ctx.reply(questions[1]);
});

let currentQuestionId = 1;

// Handler for collecting user answers
formScene.on("text", (ctx) => {
  const userId = ctx.from.id;
  const userAnswer = ctx.message.text;

  userAnswers[currentQuestionId] = {
    answer: userAnswer,
    photo: null,
  };

  currentQuestionId++;
  if (currentQuestionId <= Object.keys(questions).length) {
    ctx.reply(questions[currentQuestionId]);
  } else {
    ctx.reply("Илтимос расмингизни жўнатсангиз (селфи тариқасида)!");
    currentQuestionId++;
  }
});

// Handler for collecting the photo
formScene.on("photo", async (ctx) => {
  const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  userAnswers.photo = photo; // Assign photo file ID to userAnswers
  ctx.reply("Сўровнома жўнатилади!");

  // Generate PDF with answers and send to the channel
  await generateAndSendPDF(ctx);

  // Clear userAnswers after sending to the channel
  Object.keys(userAnswers).forEach((key) => delete userAnswers[key]);
  currentQuestionId = 1;

  // Return to the initial state
  ctx.scene.leave();
});

// Register the scene
const stage = new Scenes.Stage([formScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
  const button = Markup.inlineKeyboard([
    Markup.button.callback("Анкета толдириш", "start_form"),
  ]);
  ctx.reply("Бошлаш учун тугма:", button);
});

bot.action("start_form", (ctx) => {
  ctx.scene.enter("formScene");
});

bot.launch();

// Generate PDF with answers and send to the channel
async function generateAndSendPDF(ctx) {
  const templatePath = path.join(__dirname, "template.html");
  const outputPath = path.join(__dirname, "output.pdf");

  const photoFileId = userAnswers.photo;
  const photoLink = await getPhotoLink(ctx, photoFileId);

  const htmlTemplate = generateHTMLTemplate(photoLink);

  fs.writeFileSync(templatePath, htmlTemplate);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-setuid-sandbox",
      "--no-zygote",
    ],
  });

  const page = await browser.newPage();
  await page.goto(`file:${templatePath}`, { waitUntil: "networkidle0" });
  await page.pdf({ path: outputPath, format: "A4", printBackground: true });

  await browser.close();

  // Send the PDF file to the channel
  await ctx.telegram.sendDocument(channelChatId, {
    source: fs.createReadStream(outputPath),
    filename: "answers.pdf",
  });

  // Remove the temporary template and output files
  fs.unlinkSync(templatePath);
  fs.unlinkSync(outputPath);
}

async function getPhotoLink(ctx, fileId) {
  const file = await ctx.telegram.getFile(fileId, { limit: 10 * 1024 * 1024 });
  const fileLink = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
  return fileLink;
}

// Generate the HTML template
function generateHTMLTemplate(photoLink) {
  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap');
          body {
            padding-left: 20px;
            font-family: "Roboto", sans-serif;
          }
          img {
            width: 100px;
          }

          li {
            margin-bottom: 12px;
          }
        </style>
      </head>
      <body>
        <h1>Anketa</h1>
        <ul>
  `;

  if (photoLink) {
    html += `<img src="${photoLink}" alt="User Photo" />`;
  }

  for (const [questionId, question] of Object.entries(questions)) {
    const answerObj = userAnswers[questionId];
    const answer = answerObj ? answerObj.answer : "Not answered";
    html += `<li>${question}: <span>${answer}</span></li>`;
  }

  html += `
    </ul>
      </body>
    </html>
  `;

  return html;
}
