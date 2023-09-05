require("dotenv").config();
const { session, Markup } = require("telegraf");
const fs = require("fs");
const Telegraf = require("telegraf");
const Composer = require("telegraf/composer");
const WizardScene = require("telegraf/scenes/wizard");
const Stage = require("telegraf/stage");

const bot = new Telegraf("6585859940:AAFNICDaPXDicVKe2iI9fccQ0mYSLhuOyk4");

// Logo

const logoPath = "./assets/logo_1.png";
const logoData = fs.readFileSync(logoPath);

// Encode the logo as Base64
const logoBase64 = logoData.toString("base64");

const photoHandler = new Composer();
photoHandler.on("photo", async (ctx) => {
  let res = await ctx.telegram.getFile(
    ctx.message.photo[ctx.message.photo.length - 1].file_id
  );
  ctx.session.img =
    "https://api.telegram.org/file/bot" +
    "6585859940:AAFNICDaPXDicVKe2iI9fccQ0mYSLhuOyk4" +
    "/" +
    res.file_path;
  ctx.reply(
    "Аризангиз юборилди",
    Markup.inlineKeyboard([
      Markup.callbackButton("Biz haqimizda", "about"),
      Markup.callbackButton("Anketa to’ldirish", "anketa"),
    ]).extra()
  );
  const pdf = require("pdf-creator-node");
  const fs = require("fs");

  // Read HTML Template
  let html = fs.readFileSync("template.html", "utf8");
  let document = {
    html: html,
    data: {
      users: [
        {
          name: ctx.session.name,
          age: ctx.session.birth,
          manzil: ctx.session.manzil,
          oila: ctx.session.oila,
          number: ctx.session.number,
          malumot: ctx.session.malumot,
          computer: ctx.session.computer,
          ohirgi_ish: ctx.session.ohirgi_ish,
          bizda_maosh: ctx.session.bizda_maosh,
          ohirgi_ish_malumot: ctx.session.ohirgi_ish_malumot,
          ohirgi_ish_maosh: ctx.session.ohirgi_ish_maosh,
          qaysi_ish: ctx.session.qaysi_ish,
          qancha_ishlaysiz: ctx.session.qancha_ishlaysiz,
          transport_is_need: ctx.session.transport,
          about_me: ctx.session.about_me,
          transport: ctx.session.transport,
          vacancy: ctx.session.vacancy,
          img: ctx.session.img,
          logo: "data:image/png;base64," + logoBase64,
        },
      ],
    },
    path: "./anketa/" + ctx.from.id + ".pdf",
    type: "",
  };
  pdf
    .create(document, options)
    .then(() => {
      ctx.telegram.sendDocument(
        -1001929825010,
        { source: "./anketa/" + ctx.from.id + ".pdf" },
        {
          caption:
            '<b>Yangi zayavka!</b>\n\n Foydalanuvchi <a href="tg://user?id=' +
            ctx.from.id +
            '">' +
            ctx.from.id +
            "</a>",
          parse_mode: "html",
        }
      );
    })
    .catch((error) => {
      console.error(error);
    });
  return ctx.scene.leave();
});

const malumotHandler = new Composer();
malumotHandler.on("callback_query", async (ctx) => {
  ctx.session.malumot = ctx.update.callback_query.data;
  ctx.reply(
    "Оилавий аxволингиз?",
    Markup.inlineKeyboard([
      Markup.callbackButton("турмуш курган", "турмуш курган"),
      Markup.callbackButton("турмуш курмаган", "турмуш курмаган"),
    ]).extra()
  );
  ctx.deleteMessage(ctx.callbackQuery.message.message_id).catch(() => {});
  return ctx.wizard.next();
});

const oilaHandler = new Composer();
oilaHandler.on("callback_query", async (ctx) => {
  ctx.session.oila = ctx.update.callback_query.data;
  ctx.deleteMessage(ctx.callbackQuery.message.message_id).catch(() => {});
  ctx.reply("Қайси компьютер дастурларида ишлагансиз?");
  return ctx.wizard.next();
});

const fieldHandler = new Composer();
fieldHandler.on("callback_query", async (ctx) => {
  ctx.session.qaysi_ish = ctx.update.callback_query.data;

  ctx.deleteMessage(ctx.callbackQuery.message.message_id).catch(() => {});
  ctx.reply("Бизнинг корхонада канча муддат ишламокчисиз?");
  return ctx.wizard.next();
});

const transportHandler = new Composer();
transportHandler.on("callback_query", async (ctx) => {
  ctx.session.transport = ctx.update.callback_query.data;

  ctx.deleteMessage(ctx.callbackQuery.message.message_id).catch(() => {});
  ctx.reply(
    "Ваканция хақида қаердан билдингиз. (танишим орқали, телеграм, ОЛХ, танишим сизнинг заводингизда ишлайди)s"
  );
  return ctx.wizard.next();
});

const name = new Composer();
name.on("text", (ctx) => {
  ctx.session.name = ctx.message.text;
  ctx.reply("Тугилган санангиз");
  return ctx.wizard.next();
});

const sana = new Composer();
sana.on("text", (ctx) => {
  ctx.session.birth = ctx.message.text;

  ctx.reply("Яшаш манзилингиз (Шахар, Туман)");
  return ctx.wizard.next();
});

const manzil = new Composer();
manzil.on("text", (ctx) => {
  ctx.session.manzil = ctx.message.text;
  ctx.reply("Телефон ракамингиз");
  return ctx.wizard.next();
});

const telefon = new Composer();
telefon.on("text", (ctx) => {
  ctx.session.number = ctx.message.text;
  ctx.reply(
    "Маълумотингиз?",
    Markup.inlineKeyboard([
      Markup.callbackButton("Орта таълим", "Орта таълим"),
      Markup.callbackButton("Олий таълим", "Олий таълим"),
    ]).extra()
  );
  return ctx.wizard.next();
});

const computer = new Composer();
computer.on("text", (ctx) => {
  ctx.session.computer = ctx.message.text;
  ctx.reply("Охирги маротаба каерларда ишлагансиз?");
  return ctx.wizard.next();
});

const ohirgi_ish = new Composer();
ohirgi_ish.on("text", (ctx) => {
  ctx.session.ohirgi_ish = ctx.message.text;
  ctx.reply("Охирги иш жойингизда ишдан бушаш сабабингиз");
  return ctx.wizard.next();
});

const sabab = new Composer();
sabab.on("text", (ctx) => {
  ctx.session.ohirgi_ish_malumot = ctx.message.text;
  ctx.reply("Охирги иш урнингиздаги ойлик маошингиз канча булган");
  return ctx.wizard.next();
});

const ohirgi_ish_maosh = new Composer();
ohirgi_ish_maosh.on("text", (ctx) => {
  ctx.session.ohirgi_ish_maosh = ctx.message.text;
  ctx.reply("Бизда канча микдорли маошга ишламокчисиз (ёзишингиз шарт)");
  return ctx.wizard.next();
});

const bizda_maosh = new Composer();
bizda_maosh.on("text", (ctx) => {
  ctx.session.bizda_maosh = ctx.message.text;
  ctx.reply(
    "Кайси йуналишда ишламокчисиз?",
    Markup.inlineKeyboard([
      [Markup.callbackButton("оддий ходим", "оддий ходим")],
      [Markup.callbackButton("сотув", "сотув")],
      [Markup.callbackButton("тукувчи", "тукувчи")],
      [Markup.callbackButton("бичувчи", "бичувчи")],
      [Markup.callbackButton("омборчи ", "омборчи ")],
      [Markup.callbackButton("бухгалтерия", "бухгалтерия")],
      [Markup.callbackButton("экономист", "экономист")],
      [Markup.callbackButton("бошка...", "бошка...")],
    ]).extra()
  );
  return ctx.wizard.next();
});

const qancha_ishlaysiz = new Composer();
qancha_ishlaysiz.on("text", (ctx) => {
  ctx.session.qancha_ishlaysiz = ctx.message.text;
  ctx.reply("Узингиз хакингизда нималар кушмокчисиз");
  return ctx.wizard.next();
});

const about_me = new Composer();
about_me.on("text", (ctx) => {
  ctx.session.about_me = ctx.message.text;
  ctx.reply(
    "Корхонага қатнш учун сизга корхона томонидан транспорт зарур бўладими?",
    Markup.inlineKeyboard([
      [Markup.callbackButton("йук", "йук")],
      [Markup.callbackButton("Ха", "Ха")],
      [
        Markup.callbackButton(
          "ишни давомида аниқ бўлади",
          "ишни давомида аниқ бўлади"
        ),
      ],
    ]).extra()
  );
  return ctx.wizard.next();
});

const vacancy = new Composer();
vacancy.on("text", (ctx) => {
  ctx.session.vacancy = ctx.message.text;
  ctx.reply("Расмингизни жўнатинг (3x4 ёки селфи тарикасида булиши шарт)");
  return ctx.wizard.next();
});

const infoScene = new WizardScene(
  "infoScene",
  (ctx) => {
    ctx.reply("Фамилия, исм-шарифингиз");
    return ctx.wizard.next();
  },
  name,
  sana,
  manzil,
  telefon,
  malumotHandler,
  oilaHandler,
  computer,
  ohirgi_ish,
  sabab,
  ohirgi_ish_maosh,
  bizda_maosh,
  fieldHandler,
  qancha_ishlaysiz,
  about_me,
  transportHandler,
  vacancy,
  photoHandler
);

infoScene.start((ctx) => {
  ctx.scene.leave();
  ctx.replyWithHTML(
    "<b>Assalomu Aleykum</b> " +
      ctx.from.first_name +
      " <b>AmiraTextile HR botiga Xush Kelibsiz!</b>",
    Markup.inlineKeyboard([
      Markup.callbackButton("Biz haqimizda", "about"),
      Markup.callbackButton("Anketa to’ldirish", "anketa"),
    ]).extra()
  );
});

const stage = new Stage([infoScene]);

const options = {
  format: "A4",
  orientation: "portrait",
  border: "7mm",
  header: {
    height: "6mm",
  },
  footer: {
    height: "6mm",
  },
};

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
  ctx.scene.leave();
  ctx.replyWithHTML(
    "<b>Assalomu Aleykum</b> " +
      ctx.from.first_name +
      " <b>AmiraTextile HR botiga Xush Kelibsiz!</b>",
    Markup.inlineKeyboard([
      Markup.callbackButton("Biz haqimizda", "about"),
      Markup.callbackButton("Anketa to’ldirish", "anketa"),
    ]).extra()
  );
});

bot.action("about", async (ctx) => {
  ctx.telegram
    .editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      '<a href="https://telegra.ph/Biz-haqimizda-09-05">🇺🇿Biz haqimizda</a>',
      Markup.inlineKeyboard([
        Markup.callbackButton("Biz haqimizda", "about"),
        Markup.callbackButton("Anketa to’ldirish", "anketa"),
      ]).extra({
        parse_mode: "html",
      })
    )
    .catch(() => {});
});
bot.action("anketa", (ctx) => {
  ctx.scene.enter("infoScene");
  ctx.deleteMessage(ctx.callbackQuery.message.message_id).catch(() => {});
});

bot.catch((err) => {
  console.log(err);
});
bot.launch();
