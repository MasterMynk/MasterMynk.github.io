let installPrompt;
let date = newDate();
const html = $t("html");

class Message {
  constructor(
    from = newDate().getDate(),
    to = newDate().getDate(),
    messages = "",
    classes = [""]
  ) {
    let fromDate = newDate();
    fromDate.setDate(from);
    fromDate.setHours(0, 0, 0, 0);

    let toDate = newDate();
    toDate.setDate(to);
    toDate.setHours(23, 59, 59);

    this.toShow = newDate() >= fromDate && newDate() <= toDate;
    this.messages = messages;
    this.classes = classes;
  }

  isApplicableTo(realClass) {
    return this.classes.includes(realClass);
  }
}

const messages = [
  // All class names should be in capitals. This is because they are checked with the heading of the class.
  // new Message(
  //   2,
  //   8,
  //   [`The timetable is subject to change`],
  //   ["VIIIA", "VIIIB", "VIIIC", "VIIID", "7A", "7B", "7C", "7D"]
  // ),
];

class LiveClass {
  constructor(
    from = newDate(),
    startTime = newDate(),
    endTime = newDate(),
    name = "",
    link = "#",
    classes = [],
    hostname
  ) {
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);

    this.elem = $new("a");
    this.elem.href = link;
    this.elem.innerText = name;
    this.elem.classList.add("btn");

    if (hostname) {
      this.hostname = $new("div");
      this.hostname.classList.add("hostname");
      this.hostname.innerHTML = hostname;
    }

    this.startTime = startTime;
    const startMins = this.startTime.getMinutes();
    this.startTimeStr = `${this.startTime.getHours()}:${
      startMins < 10 ? 0 : ""
    }${startMins}`;

    this.endTime = endTime;
    const endMins = this.endTime.getMinutes();
    this.endTimeStr = `${this.endTime.getHours()}:${
      endMins < 10 ? 0 : ""
    }${this.endTime.getMinutes()}`;

    this.range = `${this.startTimeStr} - ${this.endTimeStr}`;

    this.from = from;
    this.to = to;
    this.classes = classes;
  }

  get toShow() {
    return (
      newDate() >= this.from &&
      newDate() <= this.to &&
      this.classes.some((str) => $t("h1").innerText === str)
    );
  }
}

const liveClasses = [
  new LiveClass(
    new Date(2022, 0, 2),
    new Date(2022, 0, 6, 11, 00, 0, 0),
    new Date(2022, 0, 6, 11, 45, 0, 0),
    "English",
    "https://meet.google.com/xvr-tkht-mmj",
    ["IXA"],
    "Tr. Silvaliza"
  ),
  new LiveClass(
    new Date(2022, 0, 2),
    new Date(2022, 0, 6, 9, 35, 0, 0),
    new Date(2022, 0, 6, 10, 10, 0, 0),
    "History 📜",
    "https://meet.google.com/scv-ssmo-vdg",
    ["IXB"],
    "Tr. Silvaliza"
  ),
  new LiveClass(
    new Date(2022, 0, 2),
    new Date(2022, 0, 6, 9, 0, 0, 0),
    new Date(2022, 0, 6, 9, 35, 0, 0),
    "English",
    "https://meet.google.com/xvr-tkht-mmj",
    ["IXC"],
    "Tr. Silvaliza"
  ),
];

const linkCardLiTemplate = (() => {
  const li = $new("li");
  const timingAndStatus = addTimingAndStatus(li);
  timingAndStatus.appendChild($new("div"));
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

function $new(tagName) {
  return document.createElement(tagName);
}

function swInit() {
  return new Promise((resolve) => {
    // Service worker
    if ("serviceWorker" in navigator && $('link[rel="manifest"]'))
      navigator.serviceWorker.register("/SchoolWork/TimeTable/scripts/sw.js");
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
  if ($("nav")) {
    const division = localStorage.getItem("division");

    if (division && $id(division)) $id(division).checked = true;
    else $('input[name="div"]').checked = true;
  }
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
  const timings = $$(".resp-table#curr tr > th:not(:first-child)");
  const tds = $$(".resp-table#curr tr > td:not(:first-child)");

  if (
    tds.length &&
    (mobile || window.matchMedia("(max-width: 900px)").matches) &&
    !("time" in tds[0].dataset)
  )
    tds.forEach((td, i) =>
      td.setAttribute("data-time", timings[i % timings.length].innerText)
    );
}

function update() {
  date = newDate();

  setDataTime();

  // If today isn't Sunday
  if (date.getDay()) {
    liveClasses.forEach((liveClass) => {
      if (liveClass.toShow) {
        Array.from($$("#curr tr > th:not(:first-child)")).every(
          (timing, ind, timings) => {
            let range = timing.innerText.split(" ");
            range.splice(1, 1);

            const startTime_date = timeStrToDate(range[0]);

            if (
              startTime_date.setDate(
                startTime_date.getDate() - (startTime_date.getDay() - 1)
              ) >
              new Date(liveClass.startTime).setDate(
                liveClass.startTime.getDate() -
                  (liveClass.startTime.getDay() - 1)
              )
            ) {
              // Reaching here meaning we have a class in the middle
              $$(`#curr tr > :is(td, th):nth-child(${ind + 2})`).forEach(
                (tableElem, ind) =>
                  tableElem.parentElement.insertBefore(
                    dynamicTdCreationLogic(tableElem, ind, liveClass),
                    tableElem
                  )
              );

              return false;
            }

            if (
              range[0] === liveClass.startTimeStr &&
              range[1] === liveClass.endTimeStr
            ) {
              // Reaching here meaning some class is gonna get replaced
              const td = $(
                `#curr tr:nth-child(${
                  liveClass.startTime.getDay() + 1
                }) > td:nth-child(${ind + 2})`
              );

              td.innerHTML = "";
              td.appendChild(liveClass.elem);
              liveClass.hostname && td.appendChild(liveClass.hostname);

              return false;
            }

            if (ind === timings.length - 1) {
              // Reaching here means that this class is after all others
              $$(`#curr tr > :is(td, th):nth-child(${ind + 2})`).forEach(
                (tableElem, ind) =>
                  tableElem.parentElement.appendChild(
                    dynamicTdCreationLogic(tableElem, ind, liveClass)
                  )
              );
            }

            return true;
          }
        );
      }
    });

    const todaysRow = $$(
      `#curr tr:nth-child(${date.getDay() + 1}) > td:not(:first-child)`
    );

    const todaysBtns = $cl("todays-btns");
    todaysBtns.innerHTML = "";

    todaysRow.forEach(({ children }, i) => {
      children.length &&
        todaysBtns.appendChild(
          (() => {
            const li = linkCardLiTemplate.cloneNode(true);

            // Adding the timing and status
            (() => {
              const timingAndStatus = li.firstElementChild;
              const timeDetails = timeInRange(
                addTime(
                  $(`#curr tr > th:nth-child(${i + 2})`).innerText,
                  timingAndStatus.firstElementChild
                ).innerText
              );

              statusLogic(
                timeDetails,
                timingAndStatus.children[1],
                children[0]
              );
            })();

            // Adding the button
            li.appendChild(
              (() => {
                const appendBtn = children[0].cloneNode(true);
                appendBtn.classList.add("todays");
                return appendBtn;
              })()
            );

            // Adding the host name
            children[1] && li.appendChild(children[1].cloneNode(true));

            return li;
          })()
        );
    });

    // linkCard.appendChild(todayBtns);
    goBtnUpdate();
    thirdLangDefSet();
  }

  {
    // Remove existing messageCard
    const messageCard = $(".message.card");
    messageCard && messageCard.parentElement.removeChild(messageCard);
  }

  messages.forEach((messageObj) => {
    if (
      messageObj.toShow &&
      (messageObj.classes.includes("All") ||
        messageObj.classes.includes($t(`h1`).innerText))
    ) {
      let messageCard = $(".message.card");
      if (!messageCard) {
        const cards = $cl("cards");
        messageCard = $new("li");

        messageCard.classList.add("card", "message");

        {
          // Adding the heading
          const heading = $new("h2");
          heading.innerText = "Messages:";
          messageCard.appendChild(heading);
        }
        // Adding an ol
        messageCard.appendChild($new("ol"));

        cards.insertBefore(messageCard, cards.children[0]);
      }

      // Actually adding the message in the card
      messageObj.messages.forEach((message) => {
        const messageElem = $new("li");
        messageElem.innerHTML = message;
        messageCard.getElementsByTagName("ol")[0].appendChild(messageElem);
      });
    }
  });
}

function dynamicTdCreationLogic(refElem, ind, liveClass) {
  let elemToAdd = document.createElement("td");

  if (refElem.nodeName === "TH") {
    // If we're working with the timing
    elemToAdd = refElem.cloneNode(true);
    elemToAdd.innerText = liveClass.range;
  } else if (liveClass.startTime.getDay() === ind) {
    elemToAdd.appendChild(liveClass.elem);
    liveClass.hostname && elemToAdd.appendChild(liveClass.hostname);
  }

  return elemToAdd;
}

function radioChange(callUpdate = true) {
  Array.from($$(".ind input")).every(async (btn) => {
    // Hide or show the button depending on whether its checked or not
    btn.parentElement.style.display = btn.checked ? "none" : "block";

    if (btn.checked) {
      const currHeader = $("h1").innerText;

      const newHeader =
        currHeader.slice(0, currHeader.length - 1) +
        btn.nextElementSibling.innerText;

      // Saving the selected division for next time
      localStorage.setItem("division", btn.id);

      // Hiding the selected button

      // Updating the header
      $("h1").innerText = newHeader;

      // Changing the visible table
      $id("curr").removeAttribute("id");
      $(`.${newHeader.toLowerCase()}`).setAttribute("id", "curr");

      callUpdate && update();
      return false;
    }

    return true;
  });
}

function addTimingAndStatus(parent) {
  const timingAndStatus = $new("div");

  timingAndStatus.classList.add("timing-and-status");
  parent.appendChild(timingAndStatus);

  return timingAndStatus;
}

function addTime(timeFrameText, whereTo) {
  whereTo.innerText = timeFrameText + ":";
  return whereTo;
}

function addStatus(parent) {
  const status = $new("div");

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

  const range = makeDatesFromStrArr(strRange);
  const incMinsBy = (time, offset) =>
    time.setMinutes(time.getMinutes() + offset);

  incMinsBy(range[0], -5); // starts 5 mins early
  incMinsBy(range[1], 1); // ends a min late
  if (date >= range[0] && date <= range[1])
    // Add five minutes to the difference (300000ms = 5 mins) and then convert it to minutes
    return Math.round((range[0] - date + 300000) / 1000) || true;
  return false;
}

function timeStrToDate(str) {
  const retDate = newDate();
  const arr = str.split(":");

  retDate.setHours(arr[0], arr[1], 0, 0);

  return retDate;
}

function makeDatesFromStrArr(range) {
  const retTime = [];

  range.forEach((time) => retTime.push(timeStrToDate(time)));

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

if (location.href.includes("#report-pop-up"))
  location.replace(location.pathname);
// This is used by redirect.html
localStorage.setItem("lastVisitedPage", location.pathname);

swInit();
installBtnInit();
navInit();
radioChange(false);
update();

window
  .matchMedia("(max-width: 770px)")
  .addEventListener("change", () => setDataTime(true));

// If today isn't sunday
if (date.getDay()) setInterval(statusUpdate, 1 * 1000);

divRadioInit();

$("#report-prompt.btn").onclick = () => {
  const reportList = $id("report-options");
  reportList.innerHTML = "";

  const reportCandidates = $$(".todays-btns > li > :is(.todays, .hostname)");

  reportCandidates.forEach((candidate) => {
    function wrap(elem) {
      const label = $new("label");

      label.innerHTML = `<input type="checkbox">`;
      label.appendChild(
        (() => {
          const div = document.createElement("div");

          div.classList.add("report-candidate-papa");
          div.appendChild(elem);

          return div;
        })()
      );
      label.classList.add("report");

      return label;
    }

    if (candidate.classList.contains("hostname")) {
      reportList.children[reportList.children.length - 1]
        .getElementsByClassName("report-candidate-papa")[0]
        .appendChild(candidate.cloneNode(true));
      return;
    }

    const toAdd = candidate.cloneNode(true);

    if (toAdd.classList.contains("btn")) toAdd.href = "#report-pop-up";
    else
      Array.from(toAdd.getElementsByClassName("btn")).forEach(
        (btn) => (btn.href = "#report-pop-up")
      );

    if (toAdd.classList.contains("btn-list")) {
      Array.from(toAdd.getElementsByClassName("btn")).forEach((btn) =>
        reportList.appendChild(wrap(btn))
      );
      return;
    }

    reportList.appendChild(wrap(toAdd));
  });
};

$("#report.btn").onclick = () => {
  const selectedCheckboxes = $$(
    '#report-options input[type="checkbox"]:checked'
  );

  if (selectedCheckboxes.length) {
    open(
      `mailto:mayankshigaonker.2965@rosaryhighschool.org?subject=Here are the names of the subjects in ${
        $t("h1").innerText
      } whose link didn't work for me.&body=${Array.from(
        selectedCheckboxes
      ).reduce((str, checkbox, ind, arr) => {
        const getFromCb = (className) =>
          checkbox.nextElementSibling.getElementsByClassName(className)[0];

        const btn = getFromCb("todays") || getFromCb("btn");
        const hostname = getFromCb("hostname");
        let selectedName = "";

        if (btn.nodeName === "FORM") {
          const dropdown = btn.querySelector(".dropdown");
          selectedName =
            dropdown.children[dropdown.selectedIndex].innerText.trim();
        } else selectedName = btn.innerText.trim();

        let grammar = "";

        if (ind !== 0)
          if (ind === arr.length - 1) grammar += " and ";
          else grammar += ", ";

        return `${str}${grammar}${selectedName}${
          hostname ? `(${hostname.innerText})` : ""
        }`;
      }, "")} link${
        selectedCheckboxes.length > 1 ? "s aren't" : " isn't"
      } working`
    );
    $id("report-prob").style.display = "none";
  } else $id("report-prob").style.display = "unset";
};
