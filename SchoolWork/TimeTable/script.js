let installPrompt;
let date = newDate();

const linkCardLiTemplate = (() => {
    const li = document.createElement("li");
    const timingAndStatus = addTimingAndStatus(li);
    timingAndStatus.appendChild(document.createElement("div"));
    addStatus(timingAndStatus);

    return li;
})();

const defConfig = {
    mainClr: "211, 84, 0"
};

function $(elem) { return document.querySelector(elem); }

function $$(elems) { return document.querySelectorAll(elems); }

(function main() {
    // This is used by redirect.html
    localStorage.setItem("lastVisitedPage", window.location.pathname);

    const config = getConfig();
    $("#main-clr-chooser") && ($("#main-clr-chooser").value = rgbToHex(config.mainClr));

    setMainClr(config.mainClr, config);

    swInit();
    installBtnInit();
    navInit();
    thirdLangInit();

    radioChange(false);
    update();

    window.matchMedia("(max-width: 770px)").addEventListener("change", () => setDataTime(true));

    if (date.getDay()) // If today isn't sunday
        setInterval(statusUpdate, 1 * 1000);

    $$(".go-btn") // Get all 3rd language buttons
        .forEach(goBtns => goBtns.addEventListener("click", // For each button add a click event listener
            ev => {
                const goBtn = ev.target;

                // Set the clicked go button's link to
                // the value of the select element of the button
                goBtn.setAttribute("href",
                    goBtn.previousElementSibling.value);

                // Set this as the default language now
                localStorage.setItem("thirdLang", $(`option[value="${goBtn.previousElementSibling.value}"]`).innerText.trim())
            }));
})();

function swInit() {
    // Service worker
    if ("serviceWorker" in navigator && $('link[rel="manifest"]'))
        navigator.serviceWorker.register("/SchoolWork/TimeTable/sw.js");
}

function installBtnInit() {
    // Get the prompt which usually shows up and save it
    window.addEventListener("beforeinstallprompt", e => {
        installPrompt = e;
        e.preventDefault();
        $(".install.btn") && ($(".install.btn").style.display = "block");
    });

    // When the install button is clicked show the previously saved prompt
    $(".install.btn") && $(".install.btn").addEventListener("click", async ev => {
        if (installPrompt) {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;

            if (outcome === "accepted") { // That means the user installed the website
                installPrompt = null; // So we dont need this button to work anymore
                ev.target.display = "none";
            }
        }
    });
}

function navInit() {
    if ($("nav")) {
        const division = localStorage.getItem("division");

        if (division && $(`#${division}`) && $(".ind > div:last-child > label").innerText <= division)
            $(`#${division}`).checked = true;
        else
            $('input[name="div"]').checked = true;
    }
}

function thirdLangInit() {
    if ($('[name="third-lang"].dropdown')) {
        const prefLang = localStorage.getItem("thirdLang");

        prefLang && $$('[name="third-lang"].dropdown > option').forEach(opt =>
            opt.selected = opt.innerText.trim() === prefLang
        );
    }
}

function setDataTime(mobile = false) {
    const timings = $$(".resp-table#curr tr > th:not(:first-child)");
    const tds = $$(".resp-table#curr tr > td:not(:first-child)");

    if (tds.length && (mobile || window.matchMedia("(max-width: 770px)").matches) && !("time" in tds[0].dataset))
        tds.forEach((td, i) =>
            td.setAttribute("data-time", timings[i % 2].innerText)
        );
}

function setCancelled() {
    date = newDate();

    const tds = $$(".resp-table#curr tr > td:not(:first-child)");

    tds.forEach(td => {
        if ("cancelled" in td.dataset) {
            const datesAsStr = td.dataset.cancelled;

            datesAsStr.split(", ").forEach(dateAsStr => {
                const cancelledDateStrArr = dateAsStr.split("-");
                const cancelledDate = new Date(parseInt(cancelledDateStrArr[2]), parseInt(cancelledDateStrArr[1]), parseInt(cancelledDateStrArr[0]) + 6);
                if (cancelledDate >= date)
                    td.firstElementChild.classList.add("greyed");
            });
        }
    })
}

function update() {
    date = newDate();

    setDataTime();
    setCancelled();

    if (date.getDay()) { // If today isn't Sunday
        removeExistingOl();

        const todaysRow = $$(`#curr tr:nth-child(${date.getDay() + 1}) > td:not(:first-child)`);
        const ol = document.createElement("ol");

        todaysRow.forEach(({ firstElementChild: btn }, i) => {
            if (btn)
                ol.appendChild((() => { // Adds an li
                    const li = linkCardLiTemplate.cloneNode(true);
                    const timingAndStatus = li.firstElementChild;
                    const timeDetails = timeInRange(addTime($(`#curr tr > th:nth-child(${i + 2})`).innerText, timingAndStatus.firstElementChild).innerText);

                    statusLogic(timeDetails, timingAndStatus.children[1], btn);

                    li.appendChild(btn.cloneNode(true));

                    return li;
                })());
        });

        $(".link-card").appendChild(ol);
    }
}

function radioChange(callUpdate = true) {
    Array.from($$(".ind input")).every(btn => {
        if (btn.checked) {
            const currClass = $("h1").innerText.slice(0, $("h1").innerText.length - 1) + btn.nextElementSibling.innerText;
            localStorage.setItem("division", btn.id);

            $("h1").innerText = currClass;
            $("#curr").removeAttribute("id");
            $(`.${currClass.toLowerCase()}`).setAttribute("id", "curr");
            callUpdate && update();
            return false;
        }
        return true;
    });
}

function removeExistingOl() {
    const ol = $(".link-card ol");
    ol && $(".link-card").removeChild(ol);
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
    }

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

        status.innerText = Math.floor(timeDetails / 60) +
            ":" + (secs < 10 ? "0" : "") + secs;
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
    strRange = strRange.split(' ');
    strRange.splice(1, 1);

    const range = makeDateFromStr(strRange);
    const incMinsBy = (time, offset) => time.setMinutes(time.getMinutes() + offset);

    incMinsBy(range[0], -5); // starts 5 mins early
    incMinsBy(range[1], 1); // ends a min late
    if (date >= range[0] && date <= range[1])
    // Add five minutes to the difference (300000ms = 5 mins) and then convert it to minutes
        return Math.round(((range[0] - date) + 300000) / 1000) || true;
    return false;
};

function makeDateFromStr(range) {
    const retTime = [];

    range.forEach(time => {
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
    Array.from($$(".timing-and-status")).every(timingAndStatus => {
        const timeDetails = timeInRange(timingAndStatus.firstElementChild.innerText);

        return statusLogic(timeDetails, timingAndStatus.querySelector(".status"), timingAndStatus.parentElement.lastElementChild);
    })
}

function setMainClr(to, config = getConfig()) {
    const mainClr = typeof to == "string" ? to : `${to.r}, ${to.g}, ${to.b}`

    $("html").style.setProperty("--main-clr", mainClr);

    config.mainClr = mainClr;
    saveConfig(config);
}

function mainClrChange() {
    setMainClr(hexToRGB($("#main-clr-chooser").value));
}

function hexToRGB(hex) {
    hex = hex.slice(1, hex.length);
    color = {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, hex.length), 16),
    };

    return color;
}

function rgbToHex(rgbStr) {
    rgbStr = rgbStr
        .split(", ")
        .map(clr =>
            parseInt(clr)
            .toString(16)
            .padStart(2, "0"));

    rgbStr.unshift('#');

    return rgbStr.join('');
}

function getConfig() {
    return JSON.parse(localStorage.getItem("config")) || (() => {
        const config = defConfig;

        saveConfig(config)

        return config;
    })();
}

function saveConfig(config) {
    localStorage.setItem("config", JSON.stringify(config));
}

function mainClrReset() {
    setMainClr(defConfig.mainClr);
}