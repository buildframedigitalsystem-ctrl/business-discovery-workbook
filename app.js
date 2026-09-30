/* =========================================================
   BUSINESS DISCOVERY WORKBOOK
   Interactive Discovery + AI Opportunity Scoring
========================================================= */

const STORAGE_KEY = "businessDiscoveryWorkbook";

/* =========================================================
   NAVIGATION
========================================================= */

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");
const pageTitle = document.getElementById("pageTitle");

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        navItems.forEach((nav) => nav.classList.remove("active"));
        sections.forEach((section) => section.classList.remove("active"));

        item.classList.add("active");

        const target = item.dataset.section;
        const section = document.getElementById(target);

        if (section) {
            section.classList.add("active");
        }

        pageTitle.textContent = item.textContent.replace(/^\d+/, "").trim();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});


/* =========================================================
   PROCESS INVENTORY
========================================================= */

function addProcess(data = {}) {
    const tbody = document.getElementById("processTable");

    const row = document.createElement("tr");

    row.innerHTML = `
    <td>
      <input
        type="text"
        placeholder="Process name"
        value="${escapeHTML(data.name || "")}"
        oninput="updateDashboard(); autoSave();"
      >
    </td>

    <td>
      <input
        type="text"
        placeholder="Department"
        value="${escapeHTML(data.department || "")}"
        oninput="autoSave();"
      >
    </td>

    <td>
      <input
        type="text"
        placeholder="Owner"
        value="${escapeHTML(data.owner || "")}"
        oninput="autoSave();"
      >
    </td>

    <td>
      <select onchange="autoSave();">
        <option value="">Select</option>
        <option ${data.frequency === "Daily" ? "selected" : ""}>Daily</option>
        <option ${data.frequency === "Weekly" ? "selected" : ""}>Weekly</option>
        <option ${data.frequency === "Monthly" ? "selected" : ""}>Monthly</option>
        <option ${data.frequency === "Quarterly" ? "selected" : ""}>Quarterly</option>
        <option ${data.frequency === "Ad hoc" ? "selected" : ""}>Ad hoc</option>
      </select>
    </td>

    <td>
      <input
        type="text"
        placeholder="e.g. 5 hrs/week"
        value="${escapeHTML(data.effort || "")}"
        oninput="autoSave();"
      >
    </td>

    <td>
      <input
        type="text"
        placeholder="Current tools"
        value="${escapeHTML(data.tools || "")}"
        oninput="autoSave();"
      >
    </td>

    <td>
      <button class="remove-btn" onclick="removeDynamic(this)">×</button>
    </td>
  `;

    tbody.appendChild(row);

    updateDashboard();
}


/* =========================================================
   BOTTLENECK REGISTER
========================================================= */

function addBottleneck(data = {}) {
    const container = document.getElementById("bottleneckList");

    const card = document.createElement("div");
    card.className = "dynamic-card";

    card.innerHTML = `
    <div class="dynamic-grid">

      <label>
        Bottleneck / Problem
        <input
          class="bottleneck-name"
          type="text"
          placeholder="What is slowing the business down?"
          value="${escapeHTML(data.name || "")}"
          oninput="updateDashboard(); autoSave();"
        >
      </label>

      <label>
        Business Impact
        <select onchange="autoSave();">
          <option value="">Select</option>
          <option ${data.impact === "Low" ? "selected" : ""}>Low</option>
          <option ${data.impact === "Medium" ? "selected" : ""}>Medium</option>
          <option ${data.impact === "High" ? "selected" : ""}>High</option>
          <option ${data.impact === "Critical" ? "selected" : ""}>Critical</option>
        </select>
      </label>

      <label>
        Frequency
        <select onchange="autoSave();">
          <option value="">Select</option>
          <option ${data.frequency === "Occasional" ? "selected" : ""}>Occasional</option>
          <option ${data.frequency === "Weekly" ? "selected" : ""}>Weekly</option>
          <option ${data.frequency === "Daily" ? "selected" : ""}>Daily</option>
          <option ${data.frequency === "Continuous" ? "selected" : ""}>Continuous</option>
        </select>
      </label>

    </div>

    <label style="margin-top:14px;">
      Root Cause / Notes
      <textarea
        placeholder="Why does this problem occur?"
        oninput="autoSave();"
      >${escapeHTML(data.notes || "")}</textarea>
    </label>

    <button
      class="remove-btn"
      style="margin-top:10px;"
      onclick="removeDynamic(this)"
    >×</button>
  `;

    container.appendChild(card);

    updateDashboard();
}


/* =========================================================
   AI OPPORTUNITY SCORING
========================================================= */

function addOpportunity(data = {}) {
    const container = document.getElementById("opportunityList");

    const card = document.createElement("div");
    card.className = "opportunity-card";

    card.innerHTML = `
    <label>
      AI / Automation Opportunity
      <input
        class="opportunity-name"
        type="text"
        placeholder="e.g. Inquiry triage, document processing, lead follow-up"
        value="${escapeHTML(data.name || "")}"
        oninput="updateDashboard(); autoSave();"
      >
    </label>

    <div class="score-grid">

      ${scoreSelect(
        "Business Impact",
        "impact",
        data.impact
    )}

      ${scoreSelect(
        "Repetition / Volume",
        "repetition",
        data.repetition
    )}

      ${scoreSelect(
        "Time Saving",
        "timeSaving",
        data.timeSaving
    )}

      ${scoreSelect(
        "Data Readiness",
        "dataReadiness",
        data.dataReadiness
    )}

      ${scoreSelect(
        "Implementation Ease",
        "ease",
        data.ease
    )}

      ${scoreSelect(
        "Safety / Low Risk",
        "safety",
        data.safety
    )}

    </div>

    <div class="priority-result">
      Opportunity Score:
      <strong class="score-value">0 / 30</strong>
      &nbsp; | &nbsp;
      Priority:
      <strong class="priority-label">Not scored</strong>
    </div>

    <label style="margin-top:14px;">
      Human Oversight / Guardrails
      <textarea
        placeholder="What must remain human-controlled? What requires approval?"
        oninput="autoSave();"
      >${escapeHTML(data.guardrails || "")}</textarea>
    </label>

    <button
      class="remove-btn"
      style="margin-top:10px;"
      onclick="removeDynamic(this)"
    >×</button>
  `;

    container.appendChild(card);

    const selects = card.querySelectorAll(".ai-score");

    selects.forEach((select) => {
        select.addEventListener("change", () => {
            calculateOpportunity(card);
            autoSave();
        });
    });

    calculateOpportunity(card);
    updateDashboard();
}


function scoreSelect(label, field, selectedValue = "") {
    let options = `<option value="0">Select</option>`;

    for (let i = 1; i <= 5; i++) {
        options += `
      <option value="${i}" ${Number(selectedValue) === i ? "selected" : ""}>
        ${i}
      </option>
    `;
    }

    return `
    <label>
      ${label}
      <select class="ai-score" data-field="${field}">
        ${options}
      </select>
    </label>
  `;
}


function calculateOpportunity(card) {
    const selects = card.querySelectorAll(".ai-score");

    let total = 0;
    let completed = true;

    selects.forEach((select) => {
        const value = Number(select.value);

        if (!value) {
            completed = false;
        }

        total += value;
    });

    const scoreValue = card.querySelector(".score-value");
    const priorityLabel = card.querySelector(".priority-label");

    scoreValue.textContent = `${total} / 30`;

    let priority = "Not scored";

    if (completed) {
        if (total >= 25) {
            priority = "High Priority";
        } else if (total >= 19) {
            priority = "Strong Candidate";
        } else if (total >= 13) {
            priority = "Investigate Further";
        } else {
            priority = "Low Priority";
        }
    }

    priorityLabel.textContent = priority;

    card.dataset.score = total;
    card.dataset.priority = priority;

    updateDashboard();
}


/* =========================================================
   REMOVE DYNAMIC ITEMS
========================================================= */

function removeDynamic(button) {
    const parent =
        button.closest("tr") ||
        button.closest(".dynamic-card") ||
        button.closest(".opportunity-card");

    if (parent) {
        parent.remove();
    }

    updateDashboard();
    autoSave();
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {
    /* Processes */

    const processRows =
        document.querySelectorAll("#processTable tr");

    let processCount = 0;

    processRows.forEach((row) => {
        const firstInput = row.querySelector("input");

        if (firstInput && firstInput.value.trim()) {
            processCount++;
        }
    });

    document.getElementById("processCount").textContent =
        processCount;


    /* Bottlenecks */

    const bottleneckNames =
        document.querySelectorAll(".bottleneck-name");

    let bottleneckCount = 0;

    bottleneckNames.forEach((input) => {
        if (input.value.trim()) {
            bottleneckCount++;
        }
    });

    document.getElementById("bottleneckCount").textContent =
        bottleneckCount;


    /* AI Opportunities */

    const opportunityNames =
        document.querySelectorAll(".opportunity-name");

    let opportunityCount = 0;

    opportunityNames.forEach((input) => {
        if (input.value.trim()) {
            opportunityCount++;
        }
    });

    document.getElementById("opportunityCount").textContent =
        opportunityCount;


    /* Priority opportunities */

    let priorityCount = 0;

    document
        .querySelectorAll(".opportunity-card")
        .forEach((card) => {
            if (
                card.dataset.priority === "High Priority" ||
                card.dataset.priority === "Strong Candidate"
            ) {
                priorityCount++;
            }
        });

    document.getElementById("priorityCount").textContent =
        priorityCount;


    /* Discovery completion */

    calculateCompletion();
}


/* =========================================================
   COMPLETION SCORE
========================================================= */

function calculateCompletion() {
    const fields = [
        ...document.querySelectorAll("[data-save]")
    ];

    let completed = 0;

    fields.forEach((field) => {
        if (field.value && field.value.trim() !== "") {
            completed++;
        }
    });

    const processBonus =
        document.querySelectorAll("#processTable tr").length > 0
            ? 1
            : 0;

    const bottleneckBonus =
        document.querySelectorAll(".dynamic-card").length > 0
            ? 1
            : 0;

    const aiBonus =
        document.querySelectorAll(".opportunity-card").length > 0
            ? 1
            : 0;

    const totalPossible = fields.length + 3;

    const totalCompleted =
        completed +
        processBonus +
        bottleneckBonus +
        aiBonus;

    const percentage =
        totalPossible === 0
            ? 0
            : Math.round(
                (totalCompleted / totalPossible) * 100
            );

    document.getElementById(
        "completionScore"
    ).textContent = `${percentage}%`;
}


/* =========================================================
   SAVE WORKBOOK
========================================================= */

function saveWorkbook(showMessage = true) {
    const data = {
        staticFields: [],
        processes: [],
        bottlenecks: [],
        opportunities: []
    };


    /* Static fields */

    document
        .querySelectorAll("[data-save]")
        .forEach((field, index) => {
            data.staticFields.push({
                index,
                value: field.value
            });
        });


    /* Processes */

    document
        .querySelectorAll("#processTable tr")
        .forEach((row) => {
            const inputs = row.querySelectorAll("input");
            const select = row.querySelector("select");

            data.processes.push({
                name: inputs[0]?.value || "",
                department: inputs[1]?.value || "",
                owner: inputs[2]?.value || "",
                frequency: select?.value || "",
                effort: inputs[3]?.value || "",
                tools: inputs[4]?.value || ""
            });
        });


    /* Bottlenecks */

    document
        .querySelectorAll(".dynamic-card")
        .forEach((card) => {
            const selects = card.querySelectorAll("select");

            data.bottlenecks.push({
                name:
                    card.querySelector(".bottleneck-name")
                        ?.value || "",
                impact: selects[0]?.value || "",
                frequency: selects[1]?.value || "",
                notes:
                    card.querySelector("textarea")
                        ?.value || ""
            });
        });


    /* Opportunities */

    document
        .querySelectorAll(".opportunity-card")
        .forEach((card) => {
            const scoreValues = {};

            card
                .querySelectorAll(".ai-score")
                .forEach((select) => {
                    scoreValues[select.dataset.field] =
                        select.value;
                });

            data.opportunities.push({
                name:
                    card.querySelector(".opportunity-name")
                        ?.value || "",

                ...scoreValues,

                guardrails:
                    card.querySelector("textarea")
                        ?.value || ""
            });
        });


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    if (showMessage) {
        showSavedMessage();
    }
}


/* =========================================================
   AUTO SAVE
========================================================= */

let saveTimer;

function autoSave() {
    clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {
        saveWorkbook(false);
        updateDashboard();
    }, 400);
}


/* =========================================================
   LOAD WORKBOOK
========================================================= */

function loadWorkbook() {
    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        createStarterRows();
        return;
    }

    try {
        const data = JSON.parse(saved);

        const staticFields =
            document.querySelectorAll("[data-save]");

        data.staticFields?.forEach((item) => {
            if (staticFields[item.index]) {
                staticFields[item.index].value =
                    item.value || "";
            }
        });


        if (data.processes?.length) {
            data.processes.forEach(addProcess);
        }


        if (data.bottlenecks?.length) {
            data.bottlenecks.forEach(addBottleneck);
        }


        if (data.opportunities?.length) {
            data.opportunities.forEach(addOpportunity);
        }


        if (
            !data.processes?.length &&
            !data.bottlenecks?.length &&
            !data.opportunities?.length
        ) {
            createStarterRows();
        }

    } catch (error) {
        console.error(
            "Could not load saved workbook:",
            error
        );

        createStarterRows();
    }

    updateDashboard();
}


/* =========================================================
   STARTER ROWS
========================================================= */

function createStarterRows() {
    addProcess();

    addBottleneck();

    addOpportunity();
}


/* =========================================================
   SAVED NOTIFICATION
========================================================= */

function showSavedMessage() {
    const existing =
        document.getElementById("savedToast");

    if (existing) {
        existing.remove();
    }

    const toast = document.createElement("div");

    toast.id = "savedToast";
    toast.textContent =
        "✓ Discovery workbook saved locally";

    toast.style.position = "fixed";
    toast.style.right = "25px";
    toast.style.bottom = "25px";
    toast.style.background = "#172033";
    toast.style.color = "white";
    toast.style.padding = "11px 16px";
    toast.style.borderRadius = "9px";
    toast.style.fontSize = "12px";
    toast.style.zIndex = "9999";
    toast.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.18)";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2200);
}


/* =========================================================
   SECURITY / SAFE HTML OUTPUT
========================================================= */

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   LISTEN FOR STATIC FIELD CHANGES
========================================================= */

document
    .querySelectorAll("[data-save]")
    .forEach((field) => {
        field.addEventListener("input", () => {
            autoSave();
            updateDashboard();
        });

        field.addEventListener("change", () => {
            autoSave();
            updateDashboard();
        });
    });


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadWorkbook();
        updateDashboard();
    }
);