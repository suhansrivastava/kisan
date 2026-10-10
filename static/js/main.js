// Kisan AI For Farmers - Client Interactions & Chatbot Logic

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const cropHintSelect = document.getElementById("cropHintSelect");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resultCard = document.getElementById("resultCard");
  const loadingIndicator = document.getElementById("loadingIndicator");

  // Sample quick images
  const samplePills = document.querySelectorAll(".sample-pill");
  samplePills.forEach(pill => {
    pill.addEventListener("click", () => {
      const crop = pill.getAttribute("data-crop");
      cropHintSelect.value = crop;
      // Auto-trigger sample analysis
      triggerMockUpload(crop);
    });
  });

  // Drag and Drop
  if (dropZone && fileInput) {
    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelected(fileInput.files[0]);
      }
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        handleFileSelected(fileInput.files[0]);
      }
    });
  }

  function handleFileSelected(file) {
    const preview = document.getElementById("uploadPromptText");
    if (preview) {
      preview.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    }
  }

  // Submit Detection
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", () => {
      if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please select or drop a crop leaf image first, or click a quick sample above!");
        return;
      }
      uploadAndDetect(fileInput.files[0], cropHintSelect.value);
    });
  }

  function triggerMockUpload(crop) {
    // Canvas generated leaf simulation to allow zero-file testing
    const canvas = document.createElement("canvas");
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext("2d");
    
    // Draw leaf shape
    ctx.fillStyle = crop === "healthy" ? "#16a34a" : "#854d0e";
    ctx.beginPath();
    ctx.ellipse(125, 125, 100, 60, Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();

    // Spots
    if (crop !== "healthy") {
      ctx.fillStyle = "#451a03";
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(80 + i * 15, 90 + (i % 3) * 20, 5 + (i % 4), 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    canvas.toBlob((blob) => {
      const file = new File([blob], `${crop}_leaf_sample.jpg`, { type: "image/jpeg" });
      uploadAndDetect(file, crop);
    }, "image/jpeg");
  }

  function uploadAndDetect(file, cropHint) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("crop_hint", cropHint);

    if (loadingIndicator) loadingIndicator.style.display = "inline-flex";
    if (analyzeBtn) analyzeBtn.disabled = true;

    fetch("/api/detect", {
      method: "POST",
      body: formData
    })
      .then(r => r.json())
      .then(data => {
        if (loadingIndicator) loadingIndicator.style.display = "none";
        if (analyzeBtn) analyzeBtn.disabled = false;

        if (data.success) {
          renderDetectionResult(data);
        } else {
          alert("Detection error: " + (data.error || "Unknown error"));
        }
      })
      .catch(err => {
        if (loadingIndicator) loadingIndicator.style.display = "none";
        if (analyzeBtn) analyzeBtn.disabled = false;
        console.error(err);
        alert("Failed to analyze image. Please try again.");
      });
  }

  function renderDetectionResult(res) {
    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

    document.getElementById("resImage").src = res.image_url;
    document.getElementById("resCrop").textContent = res.crop;
    document.getElementById("resDisease").textContent = res.disease_name;
    document.getElementById("resConfidence").textContent = `AI Confidence: ${res.confidence}`;
    
    const badge = document.getElementById("resSeverityBadge");
    badge.textContent = `Severity: ${res.severity}`;
    badge.className = "diagnosis-badge " + (res.is_healthy ? "badge-success" : "badge-danger");

    document.getElementById("resSymptoms").textContent = res.symptoms;
    document.getElementById("resCauses").textContent = res.causes;

    const chemList = document.getElementById("resChemicalList");
    chemList.innerHTML = "";
    (res.treatment || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      chemList.appendChild(li);
    });

    const orgList = document.getElementById("resOrganicList");
    orgList.innerHTML = "";
    (res.organic_solution || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      orgList.appendChild(li);
    });
  }

  // Mandi Search & Filtering
  const mandiSearch = document.getElementById("mandiSearch");
  const mandiStateSelect = document.getElementById("mandiStateSelect");

  if (mandiSearch && mandiStateSelect) {
    const fetchMandis = () => {
      const q = encodeURIComponent(mandiSearch.value.trim());
      const state = encodeURIComponent(mandiStateSelect.value);
      fetch(`/api/mandi?q=${q}&state=${state}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            renderMandiTable(data.mandis);
          }
        });
    };

    mandiSearch.addEventListener("input", debounce(fetchMandis, 300));
    mandiStateSelect.addEventListener("change", fetchMandis);
  }

  function renderMandiTable(mandis) {
    const tbody = document.getElementById("mandiTableBody");
    if (!tbody) return;
    if (mandis.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">No mandi market rates found matching your query.</td></tr>`;
      return;
    }

    tbody.innerHTML = mandis.map(m => `
      <tr>
        <td><strong>${m.commodity}</strong><br><small style="color:#64748b">${m.variety}</small></td>
        <td>${m.market}</td>
        <td>${m.district}, ${m.state}</td>
        <td class="price-tag">₹${m.modal_price.toLocaleString()}</td>
        <td>₹${m.min_price} - ₹${m.max_price}</td>
        <td>
          <span class="trend-badge trend-${m.trend}">
            ${m.trend === 'up' ? '▲ High' : m.trend === 'down' ? '▼ Low' : '● Stable'}
          </span>
        </td>
        <td>${m.arrival_tons} T</td>
      </tr>
    `).join("");
  }

  // Weather Location Switcher
  const weatherCitySelect = document.getElementById("weatherCitySelect");
  if (weatherCitySelect) {
    weatherCitySelect.addEventListener("change", () => {
      const city = encodeURIComponent(weatherCitySelect.value);
      fetch(`/api/weather?city=${city}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            renderWeather(data.weather);
          }
        });
    });
  }

  function renderWeather(w) {
    document.getElementById("weatherCityName").textContent = w.city;
    document.getElementById("weatherIcon").textContent = w.icon;
    document.getElementById("weatherTemp").textContent = w.temperature;
    document.getElementById("weatherCondition").textContent = w.condition;
    document.getElementById("weatherHumidity").textContent = w.humidity;
    document.getElementById("weatherWind").textContent = w.wind_speed;
    document.getElementById("weatherRain").textContent = w.rain;

    const advList = document.getElementById("weatherAdvisoryList");
    if (advList && w.advisories) {
      advList.innerHTML = w.advisories.map(a => `<li>${a}</li>`).join("");
    }
  }

  // Schemes Search & Filter
  const schemeSearch = document.getElementById("schemeSearch");
  const schemeCategorySelect = document.getElementById("schemeCategorySelect");

  if (schemeSearch && schemeCategorySelect) {
    const fetchSchemes = () => {
      const q = encodeURIComponent(schemeSearch.value.trim());
      const cat = encodeURIComponent(schemeCategorySelect.value);
      fetch(`/api/schemes?q=${q}&category=${cat}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            renderSchemes(data.schemes);
          }
        });
    };

    schemeSearch.addEventListener("input", debounce(fetchSchemes, 300));
    schemeCategorySelect.addEventListener("change", fetchSchemes);
  }

  function renderSchemes(schemes) {
    const container = document.getElementById("schemesGrid");
    if (!container) return;

    if (schemes.length === 0) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">No government schemes found matching your search.</p>`;
      return;
    }

    container.innerHTML = schemes.map(s => `
      <div class="scheme-card">
        <div class="scheme-header">
          <h3>${s.name}</h3>
          <div class="scheme-hindi">${s.hindi_name}</div>
          <span class="scheme-badge">${s.category}</span>
        </div>
        <div class="scheme-body">
          <p><strong>Benefit:</strong> ${s.benefit}</p>
          <p><strong>Eligibility:</strong> ${s.eligibility}</p>
          <p><strong>Key Documents:</strong> ${s.documents}</p>
        </div>
        <div class="scheme-footer">
          <small style="color: #64748b">📞 ${s.helpline}</small>
          <a href="${s.portal_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;">
            Official Portal ↗
          </a>
        </div>
      </div>
    `).join("");
  }

  // ==========================================
  // HAL AI Chatbot Implementation
  // ==========================================
  const chatToggle = document.getElementById("chatbotToggle");
  const chatWindow = document.getElementById("chatbotWindow");
  const chatClose = document.getElementById("chatClose");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");
  const chatMessages = document.getElementById("chatMessages");
  const chatSuggestions = document.getElementById("chatSuggestions");

  if (chatToggle && chatWindow) {
    chatToggle.addEventListener("click", () => {
      chatWindow.classList.toggle("open");
      if (chatWindow.classList.contains("open")) {
        chatInput.focus();
      }
    });

    chatClose.addEventListener("click", () => {
      chatWindow.classList.remove("open");
    });

    chatSendBtn.addEventListener("click", sendChatMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendChatMessage();
      }
    });
  }

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Append User Message
    appendMessage(text, "user");
    chatInput.value = "";

    // Show typing state
    const typingElem = document.createElement("div");
    typingElem.className = "chat-bubble bubble-bot";
    typingElem.id = "halTypingIndicator";
    typingElem.innerHTML = `<em>HAL is thinking... 🌱</em>`;
    chatMessages.appendChild(typingElem);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
      .then(r => r.json())
      .then(data => {
        const ind = document.getElementById("halTypingIndicator");
        if (ind) ind.remove();

        if (data.success) {
          appendMessage(formatMarkdown(data.reply), "bot", true);
          renderChatSuggestions(data.suggested_actions || []);
        } else {
          appendMessage("Sorry, I could not process your query right now. Please try again.", "bot");
        }
      })
      .catch(err => {
        const ind = document.getElementById("halTypingIndicator");
        if (ind) ind.remove();
        console.error(err);
        appendMessage("Network connection error. Please verify your connection.", "bot");
      });
  }

  function appendMessage(text, sender, isHtml = false) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble bubble-${sender}`;
    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function renderChatSuggestions(suggestions) {
    if (!chatSuggestions) return;
    chatSuggestions.innerHTML = "";
    suggestions.forEach(item => {
      const chip = document.createElement("span");
      chip.className = "suggestion-chip";
      chip.textContent = item;
      chip.addEventListener("click", () => {
        chatInput.value = item;
        sendChatMessage();
      });
      chatSuggestions.appendChild(chip);
    });
  }

  function formatMarkdown(str) {
    if (!str) return "";
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
});
