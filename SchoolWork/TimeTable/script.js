import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getFirestore,
  setDoc,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

let installPrompt;
let date = newDate();
const html = $t("html");

const linkCardLiTemplate = (() => {
  const li = document.createElement("li");
  const timingAndStatus = addTimingAndStatus(li);
  timingAndStatus.appendChild(document.createElement("div"));
  addStatus(timingAndStatus);

  return li;
})();

function $(elem) {
  return document.querySelector(elem);
}

function $$(elems) {
  return document.querySelectorAll(elems);
}

function $id(elem) {
  return document.getElementById(elem);
}

function $cl(elem) {
  return document.getElementsByClassName(elem)[0];
}

function $$cl(elems) {
  return document.getElementsByClassName(elems);
}

function $t(elem) {
  return document.getElementsByTagName(elem)[0];
}

function $$t(elem) {
  return document.getElementsByTagName(elem);
}

function $add(tagName) {
  return document.createElement(tagName);
}

function swInit() {
  return new Promise((resolve) => {
    // Service worker
    if ("serviceWorker" in navigator && $('link[rel="manifest"]'))
      navigator.serviceWorker.register("/SchoolWork/TimeTable/sw.js");
    resolve();
  });
}

function installBtnInit() {
  return new Promise((resolve) => {
    const installBtn = $(".install.btn");

    // Get the prompt which usually shows up and save it
    window.addEventListener("beforeinstallprompt", (e) => {
      installPrompt = e;
      e.preventDefault();
      installBtn && (installBtn.style.display = "block");
    });

    // When the install button is clicked show the previously saved prompt
    installBtn &&
      installBtn.addEventListener("click", async (ev) => {
        if (installPrompt) {
          installPrompt.prompt();
          const { outcome } = await installPrompt.userChoice;

          if (outcome === "accepted") {
            // That means the user installed the website
            installPrompt = false; // So we dont need this button to work anymore
            ev.target.display = "none";
          }
        }
      });
    resolve();
  });
}

function navInit() {
  return new Promise((resolve) => {
    if ($("nav")) {
      const division = localStorage.getItem("division");

      if (
        division &&
        $id(division) &&
        $(".ind > div:last-child > label").innerText <= division
      )
        $id(division).checked = true;
      else $('input[name="div"]').checked = true;
    }
    resolve();
  });
}

function goBtnUpdate() {
  $$("#curr .go-btn, .link-card .go-btn").forEach((btn) =>
    btn.addEventListener("mousedown", () =>
      Array.from(btn.previousElementSibling.children).every((opt) => {
        if (opt.selected) {
          btn.href = opt.value;
          localStorage.setItem("thirdLang", opt.innerText.trim());
          return false;
        }
        return true;
      })
    )
  );
}

function thirdLangDefSet() {
  if ($('[name="third-lang"].dropdown')) {
    const prefLang = localStorage.getItem("thirdLang");

    prefLang &&
      $$(
        ':is(#curr, .link-card) [name="third-lang"].dropdown > option'
      ).forEach((opt) => (opt.selected = opt.innerText.trim() === prefLang));
  }
}

function setDataTime(mobile = false) {
  return new Promise((resolve) => {
    const timings = $$(".resp-table#curr tr > th:not(:first-child)");
    const tds = $$(".resp-table#curr tr > td:not(:first-child)");

    if (
      tds.length &&
      (mobile || window.matchMedia("(max-width: 770px)").matches) &&
      !("time" in tds[0].dataset)
    )
      tds.forEach((td, i) =>
        td.setAttribute("data-time", timings[i % 2].innerText)
      );
    resolve();
  });
}

function setCancelled() {
  return new Promise((resolve) => {
    date = newDate();

    const tds = $$(".resp-table#curr tr > td:not(:first-child)");

    tds.forEach((td) => {
      if ("cancelled" in td.dataset) {
        const datesAsStr = td.dataset.cancelled;

        datesAsStr.split(", ").forEach((dateAsStr) => {
          const cancelledDateStrArr = dateAsStr.split("-");
          const cancelledDate = new Date(
            parseInt(cancelledDateStrArr[2]),
            parseInt(cancelledDateStrArr[1]),
            parseInt(cancelledDateStrArr[0]) + 6
          );
          if (cancelledDate >= date)
            td.firstElementChild.classList.add("greyed");
        });
      }
    });
    resolve();
  });
}

function update() {
  return new Promise((resolve) => {
    date = newDate();

    setDataTime();
    setCancelled();

    if (date.getDay()) {
      // If today isn't Sunday
      removeExistingOl();

      const todaysRow = $$(
        `#curr tr:nth-child(${date.getDay() + 1}) > td:not(:first-child)`
      );
      const ol = document.createElement("ol");

      todaysRow.forEach(({ firstElementChild: btn }, i) => {
        if (btn)
          ol.appendChild(
            (() => {
              // Adds an li
              const li = linkCardLiTemplate.cloneNode(true);
              const timingAndStatus = li.firstElementChild;
              const timeDetails = timeInRange(
                addTime(
                  $(`#curr tr > th:nth-child(${i + 2})`).innerText,
                  timingAndStatus.firstElementChild
                ).innerText
              );

              statusLogic(timeDetails, timingAndStatus.children[1], btn);
              li.appendChild(btn.cloneNode(true));

              return li;
            })()
          );
      });

      $cl("link-card").appendChild(ol);
      goBtnUpdate();
      thirdLangDefSet();
    }
    resolve();
  });
}

function radioChange(callUpdate = true) {
  return new Promise((resolve) => {
    Array.from($$(".ind input")).every(async (btn) => {
      if (btn.checked) {
        const currClass =
          $("h1").innerText.slice(0, $("h1").innerText.length - 1) +
          btn.nextElementSibling.innerText;
        localStorage.setItem("division", btn.id);

        $("h1").innerText = currClass;
        $id("curr").removeAttribute("id");
        $(`.${currClass.toLowerCase()}`).setAttribute("id", "curr");
        callUpdate && (await update());
        return false;
      }
      return true;
    });
    resolve();
  });
}

function removeExistingOl() {
  const ol = $(".link-card ol");
  ol && $cl("link-card").removeChild(ol);
}

function addTimingAndStatus(parent) {
  const timingAndStatus = document.createElement("div");

  timingAndStatus.classList.add("timing-and-status");
  parent.appendChild(timingAndStatus);

  return timingAndStatus;
}

function addTime(timeFrameText, whereTo) {
  whereTo.innerText = timeFrameText + ":";
  return whereTo;
}

function addStatus(parent) {
  const status = document.createElement("div");

  status.classList.add("status");
  parent.appendChild(status);

  return status;
}

function statusLogic(timeDetails, status, correspondingInp) {
  const updateActiveBtn = () => {
    activeBtnLogic(timeDetails, correspondingInp, false);
  };

  if (correspondingInp.classList.contains("greyed") && timeDetails !== false) {
    status.innerText = "Cancelled";
    status.classList.add("prob");
  } else if (timeDetails === true || timeDetails < 0) {
    status.innerText = "✓Join";
    status.classList.add("go");
    status.classList.remove("wait");
    updateActiveBtn();
  } else if (timeDetails > 0) {
    const secs = timeDetails % 60;

    status.innerText =
      Math.floor(timeDetails / 60) + ":" + (secs < 10 ? "0" : "") + secs;
    status.classList.add("wait");
    updateActiveBtn();

    return false;
  } else {
    status.innerText = "";
    status.classList.remove("prob");
    updateActiveBtn();
  }

  return true;
}

// Function for easy testing
function newDate() {
  const date = new Date();
  return date;
}

function timeInRange(strRange) {
  date = newDate();
  strRange = strRange.split(" ");
  strRange.splice(1, 1);

  const range = makeDateFromStr(strRange);
  const incMinsBy = (time, offset) =>
    time.setMinutes(time.getMinutes() + offset);

  incMinsBy(range[0], -5); // starts 5 mins early
  incMinsBy(range[1], 1); // ends a min late
  if (date >= range[0] && date <= range[1])
    // Add five minutes to the difference (300000ms = 5 mins) and then convert it to minutes
    return Math.round((range[0] - date + 300000) / 1000) || true;
  return false;
}

function makeDateFromStr(range) {
  const retTime = [];

  range.forEach((time) => {
    time = time.split(":");
    retTime.push(newDate());
    retTime[retTime.length - 1].setHours(time[0], time[1], 0, 0);
  });

  return retTime;
}

function activeBtnLogic(timeDetails, correspondingInp, greyed = true) {
  if (timeDetails) {
    // If the class is supposed to be cancelled, don't highlight it.
    if (!greyed || !correspondingInp.classList.contains("greyed"))
      correspondingInp.classList.add("active");
  } else {
    if (correspondingInp.classList.contains("active")) {
      const activeInTT = $("#curr .active");
      activeInTT && activeInTT.classList.remove("active");
    }

    correspondingInp.classList.remove("active");
  }
}

function statusUpdate() {
  Array.from($$cl("timing-and-status")).every((timingAndStatus) => {
    const timeDetails = timeInRange(
      timingAndStatus.firstElementChild.innerText
    );

    return statusLogic(
      timeDetails,
      timingAndStatus.querySelector(".status"),
      timingAndStatus.parentElement.lastElementChild
    );
  });
}

function divRadioInit() {
  const divRadios = $$('[name="div"]');
  divRadios &&
    divRadios.forEach((divRadio) =>
      divRadio.addEventListener("change", radioChange)
    );
}

window.onload = async () => {
  // This is used by redirect.html
  localStorage.setItem("lastVisitedPage", location.pathname);

  swInit();
  installBtnInit();
  navInit()
    .then(() => radioChange(false))
    .then(update);

  window
    .matchMedia("(max-width: 770px)")
    .addEventListener("change", () => setDataTime(true));

  // If today isn't sunday
  if (date.getDay()) setInterval(statusUpdate, 1 * 1000);

  divRadioInit();

  if ($cl("menu-content")) {
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

    $id("reset-all-btn").addEventListener("click", () => {
      config = defConfig;
      window.location.reload();
    });

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
      inp.addEventListener("input", () =>
        setMainClr(false, hexToRGB(inp.value))
      );
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
      normInp.addEventListener("input", () =>
        setNormFont(false, normInp.value)
      );
      themeInp.addEventListener("input", () =>
        setThemeFont(false, themeInp.value)
      );
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
      $id("border-thickness-reset").addEventListener(
        "click",
        setBorderThickness
      );

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

      bgClr.addEventListener("input", () =>
        setBgClr(false, hexToRGB(bgClr.value))
      );

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

    async function shareBtnInit() {
      const errorText = $id("share-status-text");

      const configNameInp = $id("share-config-name");
      configNameInp.addEventListener("input", () => shareStatus("", "go"));

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
              `${configName} already exists. Do you want to share this?`
            );
          } else {
            shareStatus("Uploading config", "wait");
            console.log(config.mainClr);
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
  }
};
