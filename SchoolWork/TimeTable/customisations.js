import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getFirestore,
  setDoc,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBq1PAXNffXeRF4D4oz_8nQrtSOOxj5aJM",
  authDomain: "timetable-323817.firebaseapp.com",
  projectId: "timetable-323817",
  storageBucket: "timetable-323817.appspot.com",
  messagingSenderId: "1046463361656",
  appId: "1:1046463361656:web:4e319d0cdee68bcc43738d",
  measurementId: "G-CMVGLKFCF6",
});
const db = getFirestore();
const defConfig = {
  mainClr: "211, 84, 0",
  borderRad: {
    card: 15,
    btn: 30,
  },
  bgClr: {
    clr: "25, 25, 25",
    opacity: 70,
    btn: {
      clr: "10, 10, 10",
      opacity: 50,
    },
  },
  font: {
    norm: "#eeeeee",
    theme: "#111111",
  },
  borderThickness: 2,
  blur: {
    cards: 8,
    nav: 2,
  },
  bgImg: {
    1080: "/SchoolWork/bg1080.webp",
    768: "/SchoolWork/bg768.webp",
    changed: false,
  },
};
let config = await getConf();

for (const val in defConfig) config[val] ?? (config[val] = defConfig[val]);

bgImgInit();
mainClrInit();
fontClrInit();
cardBorderRadInit();
btnBorderRadInit();
borderThicknessInit();
btnBgClrInit();
bgClrInit();
cardBlurInit();
navBlurInit();

$id("reset-all-btn").addEventListener("click", setConf);

shareBtnInit();
exportBtnInit();
importBtnInit();

window.onunload = () => {
  saveConfig(config);
};

function setProp(propName, propContent) {
  html.style.setProperty(propName, propContent);
}

function setBgClrOpacity(
  setRange = true,
  opacity = defConfig.bgClr.opacity,
  myConfig = config
) {
  setProp("--opacity", opacity / 100);
  myConfig.bgClr.opacity = opacity;
  setRange && ($id("bg-clr-opacity").value = opacity);
}

function hexToRGB(hex) {
  hex = hex.slice(1, hex.length); // Remove the #
  return `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(
    hex.slice(2, 4),
    16
  )}, ${parseInt(hex.slice(4, hex.length), 16)}`;
}

function rgbToHex(rgbStr) {
  rgbStr = rgbStr
    .split(", ")
    .map((clr) => parseInt(clr).toString(16).padStart(2, "0"));

  rgbStr.unshift("#");

  return rgbStr.join("");
}

function saveConfig(configToSave = defConfig) {
  localStorage.setItem("config", JSON.stringify(configToSave));
  return configToSave;
}

function getConfDataURI() {
  saveConfig(config);
  return encodeURIComponent(localStorage.getItem("config"));
}

function getConfName() {
  return `TimetableConf${(date = newDate())}.json`;
}

async function getConf() {
  const getConf_impl = () =>
    JSON.parse(localStorage.getItem("config")) || saveConfig();

  const configName = new URL(location).searchParams.get("configName");
  if (!configName) return getConf_impl();
  else {
    const data = (await getDoc(doc(db, "configs", configName))).data();

    console.log(data);
    return saveConfig(data) || getConf_impl();
  }
}

function mainClrInit() {
  const inp = $id("main-clr-chooser");

  setMainClr(true, config.mainClr, config);
  inp.addEventListener("input", () => setMainClr(false, hexToRGB(inp.value)));
  $id("main-clr-reset").addEventListener("click", setMainClr);

  function setMainClr(
    setClrChooser = true,
    to = defConfig.mainClr,
    myConfig = config
  ) {
    setProp("--main-clr", to);
    myConfig.mainClr = to;
    setClrChooser && (inp.value = rgbToHex(to));
  }
}

function fontClrInit() {
  const normInp = $id("norm-font-clr");
  const themeInp = $id("theme-font-clr");

  setNormFont(true, config.font.norm, config);
  setThemeFont(true, config.font.theme, config);
  normInp.addEventListener("input", () => setNormFont(false, normInp.value));
  themeInp.addEventListener("input", () => setThemeFont(false, themeInp.value));
  $id("font-clr-reset").addEventListener("click", () => {
    setNormFont();
    setThemeFont();
  });

  function setNormFont(
    setChooser = true,
    clr = defConfig.font.norm,
    myConfig = config
  ) {
    setProp("--norm-font-clr", clr);
    myConfig.font.norm = clr;
    setChooser && (normInp.value = clr);
  }

  function setThemeFont(
    setChooser = true,
    clr = defConfig.font.theme,
    myConfig = config
  ) {
    setProp("--theme-font-clr", clr);
    myConfig.font.theme = clr;
    setChooser && (themeInp.value = clr);
  }
}

function cardBorderRadInit() {
  const inp = $id("border-radius-cards");

  setCardBorderRad(
    true,
    config.borderRad.card || defConfig.borderRad.card,
    config
  );
  inp.addEventListener("input", () => setCardBorderRad(false, inp.value));
  $id("cards-border-radius-reset", setCardBorderRad);

  function setCardBorderRad(
    setRange = true,
    rad = defConfig.borderRad.card,
    myConfig = config
  ) {
    setProp("--card-border-rad", `${rad}px`);
    myConfig.borderRad.card = rad;
    setRange && (inp.value = rad);
  }
}

function btnBorderRadInit() {
  const inp = $id("border-radius-btns");

  setBtnBorderRad(true, config.borderRad.btn, config);
  inp.addEventListener("input", () => setBtnBorderRad(false, inp.value));
  $id("btn-border-rad-reset").addEventListener("click", setBtnBorderRad);

  function setBtnBorderRad(
    setRange = true,
    rad = defConfig.borderRad.btn,
    myConfig = config
  ) {
    setProp("--btn-border-rad", `${rad}px`);
    myConfig.borderRad.btn = rad;
    setRange && (inp.value = rad);
  }
}

function borderThicknessInit() {
  const borderThicknessInp = $id("border-thickness");

  setBorderThickness(true, config.borderThickness, config);
  borderThicknessInp.addEventListener("input", () =>
    setBorderThickness(false, borderThicknessInp.value)
  );
  $id("border-thickness-reset").addEventListener("click", setBorderThickness);

  function setBorderThickness(
    setRange = true,
    thickness = defConfig.borderThickness,
    myConfig = config
  ) {
    setProp("--border-thickness", `${thickness}px`);
    myConfig.borderThickness = thickness;
    if (setRange) borderThicknessInp.value = thickness;
  }
}

function btnBgClrInit() {
  const btnBgClr = [$id("bg-clr-btn"), $id("bg-clr-btn-opacity")];
  config.bgClr.btn || (config.bgClr.btn = {});

  setBtnBgClr(true, config.bgClr.btn.clr, config.bgClr.btn.opacity, config);
  btnBgClr.forEach((elem) =>
    elem.addEventListener("input", () =>
      setBtnBgClr(false, hexToRGB(btnBgClr[0].value), btnBgClr[1].value)
    )
  );
  $id("btn-bg-clr-reset").addEventListener("click", setBtnBgClr);

  function setBtnBgClr(
    setInps = true,
    clr = defConfig.bgClr.btn.clr,
    opacity = defConfig.bgClr.btn.opacity,
    myConfig = config
  ) {
    setProp("--btn-bg-clr", `rgba(${clr}, ${opacity / 100})`);

    myConfig.bgClr.btn.clr = clr;
    myConfig.bgClr.btn.opacity = opacity;

    if (setInps) {
      btnBgClr[0].value = rgbToHex(clr);
      btnBgClr[1].value = opacity;
    }
  }
}

function bgClrInit() {
  const bgClr = $id("bg-clr");
  const bgClrOpacity = $id("bg-clr-opacity");

  setBgClr(true, config.bgClr.clr, config);
  setBgClrOpacity(true, config.bgClr.opacity, config);

  bgClr.addEventListener("input", () => setBgClr(false, hexToRGB(bgClr.value)));

  bgClrOpacity.addEventListener("input", () =>
    setBgClrOpacity(false, bgClrOpacity.value)
  );

  $id("bg-clr-reset").addEventListener("click", () => {
    setBgClr();
    setBgClrOpacity();
  });

  function setBgClr(
    setClrChooser = true,
    clr = defConfig.bgClr.clr,
    myConfig = config
  ) {
    setProp("--elem-bg-clr", clr);
    myConfig.bgClr.clr = clr;
    setClrChooser && (bgClr.value = rgbToHex(clr));
  }
}

function cardBlurInit() {
  const inp = $id("bg-blur-cards");

  setCardBlur(true, config.blur.cards, config);

  inp.addEventListener("input", () =>
    setCardBlur(false, $id("bg-blur-cards").value)
  );
  $id("card-bg-blur-reset").addEventListener("click", setCardBlur);

  function setCardBlur(
    setRange = true,
    blur = defConfig.blur.cards,
    myConfig = config
  ) {
    setProp("--card-blur", `${blur}px`);
    myConfig.blur.cards = blur;
    if (setRange) inp.value = blur;
  }
}

function navBlurInit() {
  const inp = $id("bg-blur-nav");

  setNavBlur(true, config.blur.nav, config);

  inp.addEventListener("input", () => setNavBlur(false, inp.value));
  $id("nav-blur-reset").addEventListener("click", setNavBlur);

  function setNavBlur(
    setRange = true,
    blur = defConfig.blur.nav,
    myConfig = config
  ) {
    setProp("--nav-bg-blur", `${blur}px`);
    myConfig.blur.nav = blur;
    if (setRange) inp.value = blur;
  }
}

function bgImgInit() {
  const inp = $id("bg-img");

  config.bgImg.changed && loadBg(false, config.bgImg[1080], null, config);

  inp.addEventListener("change", () => setBgImg($id("bg-img").files?.[0]));
  $id("bg-img-reset").addEventListener("click", loadBg);

  function loadBg(
    reset = true,
    bg1080 = defConfig.bgImg[1080],
    bg768 = defConfig.bgImg[768],
    myConfig = config
  ) {
    setProp("--bg-1080", `url(${bg1080})`);
    setProp("--bg-768", bg768 ? `url(${bg768})` : "var(--bg-1080)");

    reset && (myConfig.bgImg = defConfig.bgImg);
  }

  function setBgImg(file, myConfig = config) {
    const reader = new FileReader();
    reader.onerror = () => {
      alert(
        `${reader.error} error occured while reading the uploaded background image.`
      );
    };

    reader.onload = () => {
      loadBg(false, reader.result, null, myConfig);

      myConfig.bgImg[1080] = reader.result;
      myConfig.bgImg.changed = true;
    };

    reader.readAsDataURL(file);
  }
}

function exportBtnInit() {
  return new Promise((resolve) => {
    $id("export-btn").addEventListener("click", (e) => {
      const a = $add("a");
      a.setAttribute(
        "href",
        "data:application/json;charset=utf-8," + getConfDataURI()
      );
      a.setAttribute("download", getConfName());
      a.click();
    });
    resolve();
  });
}

function importBtnInit() {
  return new Promise((resolve) => {
    const importInp = $id("import-inp");

    importInp.addEventListener("input", (e) => {
      const reader = new FileReader();

      reader.onerror = () => {
        alert(`${reader.error} occured while importing config`);
      };

      reader.onload = () => {
        config = JSON.parse(reader.result);
        window.location.reload();
      };

      reader.readAsText(importInp.files[0]);
    });
    resolve();
  });
}

function setConf(newConf = defConfig) {
  config = newConf;
  location.reload();
}

async function shareBtnInit() {
  const errorText = $id("share-status-text");
  const applyBtn = $id("apply-btn");

  const configNameInp = $id("share-config-name");
  configNameInp.addEventListener("input", () => {
    shareStatus("", "go");
    applyBtn.style.setProperty("display", "none");
  });

  applyBtn.addEventListener("click", async () =>
    setConf((await getDoc(doc(db, "configs", configNameInp.value))).data())
  );

  $id("create-link-btn").addEventListener("click", async () => {
    const configName = configNameInp.value;

    // If nothing is entered
    if (!configName) return shareStatus("Name is compulsory");

    const shareThrobber = $id("share-throbber");
    shareThrobber.style.display = "unset";

    const shareURL = `${
      location.href.includes("?")
        ? location.href.slice(0, location.href.indexOf("?"))
        : location.href
    }?configName=${encodeURIComponent(configName)}`;
    try {
      shareStatus("Checking name availability", "wait");
      // If that name already exists
      if ((await getDoc(doc(db, "configs", configName))).exists()) {
        shareStatus(
          `${configName} already exists. Do you want to use this instead?`
        );

        applyBtn.style.setProperty("display", "unset");
      } else {
        applyBtn.style.setProperty("display", "none");

        shareStatus("Uploading config", "wait");
        await setDoc(doc(db, "configs", configName), config);
        shareStatus("✓ Ready to Share", "go");
      }
    } catch (e) {
      shareStatus(`I failed :( -- The problem: "${e.message}"`);
    }
    activateShareBtn(shareURL);

    shareThrobber.style.display = "none";
  });

  function shareStatus(error, className = "prob") {
    errorText.innerText = error;

    errorText.removeAttribute("class");
    errorText.classList.add(className);
    errorText.style.setProperty("display", error ? "unset" : "none");
  }

  function activateShareBtn(shareURL = location.pathname) {
    const shareBtn = $id("share-btn");

    shareBtn.style.setProperty("display", "unset");
    shareBtn.addEventListener(
      "click",
      "canShare" in navigator
        ? () => {
            shareStatus("✓ Upload successful", "go");
            navigator.share({
              text: "Click me!!",
              url: shareURL,
            });
          }
        : async () => {
            await navigator.clipboard.writeText(shareURL);
            shareStatus("✓ Share the link copied to your clipboard", "go");
          }
    );
  }
}
