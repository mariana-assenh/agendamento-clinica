const STORAGE_KEYS = {
  bookings: "ponto-equilibrio-bookings",
  settings: "ponto-equilibrio-google-settings",
};

const ADMIN_PIN = "2468";
const TIME_ZONE = "America/Sao_Paulo";
const OWNER_EMAIL = "contato.dequilibrio@gmail.com";
const SLOT_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const BOOKING_TYPES = {
  ponto: {
    label: "Profissional da Ponto",
    cssClass: "type-ponto",
    colorName: "Rosa",
    hex: "#EF8F8A",
    googleColorId: "4",
  },
  coworking: {
    label: "Coworking",
    cssClass: "type-coworking",
    colorName: "Azul",
    hex: "#5AA7E0",
    googleColorId: "9",
  },
  salao: {
    label: "Sal\u00e3o",
    cssClass: "type-salao",
    colorName: "Amarelo",
    hex: "#F1C95B",
    googleColorId: "5",
  },
};

const weekdayNames = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const shortWeekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const elements = {
  adminStatus: document.querySelector("#adminStatus"),
  adminPin: document.querySelector("#adminPin"),
  adminButton: document.querySelector("#adminButton"),
  bookingForm: document.querySelector("#bookingForm"),
  formTitle: document.querySelector("#formTitle"),
  slotMessage: document.querySelector("#slotMessage"),
  dateInput: document.querySelector("#dateInput"),
  timeInput: document.querySelector("#timeInput"),
  durationInput: document.querySelector("#durationInput"),
  professionalInput: document.querySelector("#professionalInput"),
  customerInput: document.querySelector("#customerInput"),
  roomNumberInputs: document.querySelectorAll('input[name="roomNumber"]'),
  bookingTypeInputs: document.querySelectorAll('input[name="bookingType"]'),
  specialtyInput: document.querySelector("#specialtyInput"),
  notesInput: document.querySelector("#notesInput"),
  saveButton: document.querySelector("#saveButton"),
  deleteButton: document.querySelector("#deleteButton"),
  clearButton: document.querySelector("#clearButton"),
  ownerEmailInput: document.querySelector("#ownerEmailInput"),
  roomInput: document.querySelector("#roomInput"),
  integrationNotice: document.querySelector("#integrationNotice"),
  saveGoogleButton: document.querySelector("#saveGoogleButton"),
  openGoogleButton: document.querySelector("#openGoogleButton"),
  downloadIcsButton: document.querySelector("#downloadIcsButton"),
  prevWeekButton: document.querySelector("#prevWeekButton"),
  nextWeekButton: document.querySelector("#nextWeekButton"),
  todayButton: document.querySelector("#todayButton"),
  jumpDateInput: document.querySelector("#jumpDateInput"),
  weekTitle: document.querySelector("#weekTitle"),
  calendarGrid: document.querySelector("#calendarGrid"),
  toast: document.querySelector("#toast"),
};

const state = {
  bookings: loadBookings(),
  settings: loadSettings(),
  isAdmin: false,
  selectedDate: toISODate(new Date()),
  selectedTime: nextAvailableTime(),
  editingId: null,
  lastBookingId: null,
  weekStart: startOfWeek(new Date()),
};

init();

function init() {
  SLOT_TIMES.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    elements.timeInput.append(option);
  });

  elements.dateInput.value = state.selectedDate;
  elements.timeInput.value = state.selectedTime;
  elements.jumpDateInput.value = state.selectedDate;
  elements.ownerEmailInput.value = OWNER_EMAIL;
  elements.ownerEmailInput.readOnly = true;
  elements.roomInput.value = state.settings.roomName;

  elements.adminButton.addEventListener("click", handleAdminToggle);
  elements.bookingForm.addEventListener("submit", handleBookingSubmit);
  elements.deleteButton.addEventListener("click", handleDeleteBooking);
  elements.clearButton.addEventListener("click", resetForm);
  elements.saveGoogleButton.addEventListener("click", saveGoogleSettings);
  elements.openGoogleButton.addEventListener("click", openGoogleCalendar);
  elements.downloadIcsButton.addEventListener("click", downloadIcsFile);
  elements.prevWeekButton.addEventListener("click", () => moveWeek(-7));
  elements.nextWeekButton.addEventListener("click", () => moveWeek(7));
  elements.todayButton.addEventListener("click", goToToday);
  elements.jumpDateInput.addEventListener("change", handleJumpDate);
  elements.dateInput.addEventListener("change", handleFormDateChange);
  elements.timeInput.addEventListener("change", handleFormSlotChange);
  elements.durationInput.addEventListener("change", handleFormSlotChange);
  elements.roomNumberInputs.forEach((input) => input.addEventListener("change", handleFormSlotChange));
  elements.bookingTypeInputs.forEach((input) => input.addEventListener("change", refreshFormAvailability));

  render();
  refreshFormAvailability();
}

function loadBookings() {
  const saved = localStorage.getItem(STORAGE_KEYS.bookings);
  if (saved) {
    try {
      return JSON.parse(saved).map(normalizeBooking);
    } catch (error) {
      console.warn("Reservas salvas inválidas", error);
    }
  }

  const today = new Date();
  const first = addDays(today, 1);
  const second = addDays(today, 2);
  const third = addDays(startOfWeek(today), 4);

  const seeded = [
    {
      id: createId(),
      date: toISODate(first),
      time: "09:00",
      duration: 60,
      professional: "Mariana Costa",
      customerName: "Cliente em avaliação",
      roomNumber: "3",
      bookingType: "ponto",
      specialty: "Estética avançada",
      notes: "Limpeza de pele e avaliação.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: createId(),
      date: toISODate(second),
      time: "14:00",
      duration: 90,
      professional: "Renata Oliveira",
      customerName: "Cliente coworking",
      roomNumber: "2",
      bookingType: "coworking",
      specialty: "Massoterapia",
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: createId(),
      date: toISODate(third),
      time: "16:00",
      duration: 60,
      professional: "Camila Rocha",
      customerName: "Cliente do salão",
      roomNumber: "4",
      bookingType: "salao",
      specialty: "Psicologia",
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(seeded));
  return seeded;
}

function normalizeBooking(booking) {
  return {
    ...booking,
    customerName: booking.customerName || "",
    roomNumber: ["1", "2", "3", "4"].includes(String(booking.roomNumber)) ? String(booking.roomNumber) : "1",
    bookingType: BOOKING_TYPES[booking.bookingType] ? booking.bookingType : "ponto",
  };
}

function bookingTypeInfo(bookingType) {
  return BOOKING_TYPES[bookingType] || BOOKING_TYPES.ponto;
}

function loadSettings() {
  const defaults = {
    ownerEmail: OWNER_EMAIL,
    roomName: "Sala Ponto de Equilíbrio",
  };
  const saved = localStorage.getItem(STORAGE_KEYS.settings);

  if (!saved) {
    return defaults;
  }

  try {
    return { ...defaults, ...JSON.parse(saved), ownerEmail: OWNER_EMAIL };
  } catch (error) {
    console.warn("Configuração Google inválida", error);
    return defaults;
  }
}

function saveBookings() {
  const sorted = [...state.bookings]
    .map(normalizeBooking)
    .sort((a, b) => `${a.date}${a.time}${a.roomNumber}`.localeCompare(`${b.date}${b.time}${b.roomNumber}`));
  state.bookings = sorted;
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(sorted));
}

function saveGoogleSettings() {
  state.settings = {
    ownerEmail: OWNER_EMAIL,
    roomName: elements.roomInput.value.trim() || "Sala Ponto de Equilíbrio",
  };
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  elements.ownerEmailInput.value = OWNER_EMAIL;
  showToast("Nome da sala salvo.");
  updateGoogleButtons();
}

function handleAdminToggle() {
  if (state.isAdmin) {
    state.isAdmin = false;
    state.editingId = null;
    elements.adminPin.value = "";
    resetForm();
    showToast("Modo público ativado.");
    render();
    return;
  }

  if (elements.adminPin.value.trim() !== ADMIN_PIN) {
    showToast("PIN admin inválido.");
    elements.adminPin.focus();
    return;
  }

  state.isAdmin = true;
  elements.adminPin.value = "";
  showToast("Modo admin ativo.");
  render();
  refreshFormAvailability();
}

function handleBookingSubmit(event) {
  event.preventDefault();

  const booking = readFormBooking();
  const conflicts = findConflicts(booking.date, booking.time, booking.duration, booking.roomNumber, state.editingId);
  let completionMessage = "";

  if (conflicts.length && !state.isAdmin) {
    setSlotMessage("Este horário já está reservado. Escolha outro horário livre.", "warning");
    showToast("Horário ocupado.");
    return;
  }

  if (conflicts.length && state.isAdmin) {
    const replace = window.confirm("Este horário tem reserva cadastrada. Substituir como admin?");
    if (!replace) {
      return;
    }
    const conflictIds = new Set(conflicts.map((item) => item.id));
    state.bookings = state.bookings.filter((item) => !conflictIds.has(item.id));
  }

  if (state.editingId) {
    const existing = state.bookings.find((item) => item.id === state.editingId);
    const updated = {
      ...booking,
      id: state.editingId,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.bookings = state.bookings.map((item) => (item.id === state.editingId ? updated : item));
    state.lastBookingId = updated.id;
    completionMessage = "Reserva atualizada. Conclua salvando o evento no Google Agenda.";
    showToast("Abra o Google para concluir.");
  } else {
    const created = {
      ...booking,
      id: createId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.bookings.push(created);
    state.lastBookingId = created.id;
    completionMessage = "Horário reservado. Conclua salvando o evento no Google Agenda.";
    showToast("Abra o Google para concluir.");
  }

  saveBookings();
  state.selectedDate = booking.date;
  state.selectedTime = booking.time;
  state.weekStart = startOfWeek(parseDate(booking.date));
  elements.jumpDateInput.value = booking.date;
  render();
  refreshFormAvailability();
  setSlotMessage(completionMessage, "warning");
}

function handleDeleteBooking() {
  if (!state.isAdmin || !state.editingId) {
    return;
  }

  const booking = state.bookings.find((item) => item.id === state.editingId);
  if (!booking) {
    return;
  }

  const shouldDelete = window.confirm(`Excluir a reserva de ${booking.professional} na sala ${booking.roomNumber}?`);
  if (!shouldDelete) {
    return;
  }

  state.bookings = state.bookings.filter((item) => item.id !== state.editingId);
  saveBookings();
  state.editingId = null;
  showToast("Reserva excluída.");
  resetForm();
  render();
}

function handleJumpDate() {
  if (!elements.jumpDateInput.value) {
    return;
  }
  const date = parseDate(elements.jumpDateInput.value);
  state.weekStart = startOfWeek(date);
  state.selectedDate = toISODate(date);
  elements.dateInput.value = state.selectedDate;
  render();
  refreshFormAvailability();
}

function handleFormDateChange() {
  if (!elements.dateInput.value) {
    return;
  }
  state.selectedDate = elements.dateInput.value;
  state.weekStart = startOfWeek(parseDate(state.selectedDate));
  elements.jumpDateInput.value = state.selectedDate;
  state.editingId = null;
  render();
  refreshFormAvailability();
}

function handleFormSlotChange() {
  state.selectedDate = elements.dateInput.value || state.selectedDate;
  state.selectedTime = elements.timeInput.value || state.selectedTime;
  state.editingId = null;
  render();
  refreshFormAvailability();
}

function moveWeek(days) {
  state.weekStart = addDays(state.weekStart, days);
  elements.jumpDateInput.value = toISODate(state.weekStart);
  render();
}

function goToToday() {
  const today = new Date();
  state.weekStart = startOfWeek(today);
  state.selectedDate = toISODate(today);
  state.selectedTime = nextAvailableTime();
  elements.dateInput.value = state.selectedDate;
  elements.timeInput.value = state.selectedTime;
  elements.jumpDateInput.value = state.selectedDate;
  state.editingId = null;
  render();
  refreshFormAvailability();
}

function selectSlot(date, time, bookingId = null) {
  const selectedRoom = getCheckedValue("roomNumber", "1");
  const booking = bookingId
    ? state.bookings.find((item) => item.id === bookingId)
    : findBookingForRoomAt(date, time, selectedRoom);
  state.selectedDate = date;
  state.selectedTime = time;
  elements.dateInput.value = date;
  elements.timeInput.value = time;
  elements.jumpDateInput.value = date;

  if (booking && state.isAdmin) {
    populateForm(booking);
    state.editingId = booking.id;
  } else {
    state.editingId = null;
    if (!booking) {
      clearProfessionalFields();
      elements.durationInput.value = "60";
    } else {
      elements.durationInput.value = String(booking.duration);
    }
  }

  render();
  refreshFormAvailability();
}

function resetForm() {
  state.editingId = null;
  elements.bookingForm.reset();
  elements.dateInput.value = state.selectedDate || toISODate(new Date());
  elements.timeInput.value = state.selectedTime || nextAvailableTime();
  elements.durationInput.value = "60";
  clearProfessionalFields();
  render();
  refreshFormAvailability();
}

function populateForm(booking) {
  elements.dateInput.value = booking.date;
  elements.timeInput.value = booking.time;
  elements.durationInput.value = String(booking.duration);
  elements.professionalInput.value = booking.professional;
  elements.customerInput.value = booking.customerName || "";
  setCheckedValue("roomNumber", booking.roomNumber || "1");
  setCheckedValue("bookingType", booking.bookingType || "ponto");
  elements.specialtyInput.value = booking.specialty;
  elements.notesInput.value = booking.notes || "";
  state.lastBookingId = booking.id;
}

function clearProfessionalFields() {
  elements.professionalInput.value = "";
  elements.customerInput.value = "";
  elements.specialtyInput.value = "";
  elements.notesInput.value = "";
}

function getCheckedValue(name, fallback) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || fallback;
}

function setCheckedValue(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) {
    input.checked = true;
  }
}

function refreshFormAvailability() {
  const date = elements.dateInput.value;
  const time = elements.timeInput.value;
  const duration = Number(elements.durationInput.value || 60);
  const roomNumber = getCheckedValue("roomNumber", "1");
  const conflicts = date && time ? findConflicts(date, time, duration, roomNumber, state.editingId) : [];
  const existing = date && time ? findBookingForRoomAt(date, time, roomNumber) : null;
  const saveLabel = elements.saveButton.querySelector("span");

  elements.adminStatus.textContent = state.isAdmin ? "Admin" : "Público";
  elements.adminStatus.classList.toggle("active", state.isAdmin);
  elements.formTitle.textContent = state.editingId ? "Editar horário" : existing && !state.isAdmin ? "Horário ocupado" : "Novo horário";
  elements.deleteButton.classList.toggle("visible", Boolean(state.isAdmin && state.editingId));

  if (state.editingId) {
    saveLabel.textContent = "Salvar alteração";
    elements.saveButton.disabled = false;
    setSlotMessage("Admin pode alterar ou excluir esta reserva.", "success");
  } else if (conflicts.length && state.isAdmin) {
    saveLabel.textContent = "Substituir horário";
    elements.saveButton.disabled = false;
    setSlotMessage(`Sala ${roomNumber} ocupada neste horário. Admin pode substituir esta reserva.`, "warning");
  } else if (conflicts.length) {
    saveLabel.textContent = "Reservar horário";
    elements.saveButton.disabled = true;
    const bookedBy = conflicts[0];
    setSlotMessage(`${time} na sala ${roomNumber} já está reservado para ${bookedBy.professional} (${bookedBy.specialty}).`, "warning");
  } else {
    saveLabel.textContent = "Reservar horário";
    elements.saveButton.disabled = false;
    setSlotMessage(`${formatDateLong(date)} às ${time}, sala ${roomNumber}, está livre.`, "success");
  }

  updateGoogleButtons();
}

function readFormBooking() {
  return {
    date: elements.dateInput.value,
    time: elements.timeInput.value,
    duration: Number(elements.durationInput.value),
    professional: elements.professionalInput.value.trim(),
    customerName: elements.customerInput.value.trim(),
    roomNumber: getCheckedValue("roomNumber", "1"),
    bookingType: getCheckedValue("bookingType", "ponto"),
    specialty: elements.specialtyInput.value,
    notes: elements.notesInput.value.trim(),
  };
}

function render() {
  renderWeekTitle();
  renderCalendarGrid();
  refreshFormAvailability();
}

function renderWeekTitle() {
  const start = state.weekStart;
  const end = addDays(start, 5);
  elements.weekTitle.textContent = `${start.getDate()} de ${monthNames[start.getMonth()]} a ${end.getDate()} de ${monthNames[end.getMonth()]}`;
}

function renderCalendarGrid() {
  const days = Array.from({ length: 6 }, (_, index) => addDays(state.weekStart, index));
  elements.calendarGrid.replaceChildren();

  const corner = document.createElement("div");
  corner.className = "grid-header";
  corner.innerHTML = "<strong>Hora</strong><span>Sala</span>";
  elements.calendarGrid.append(corner);

  days.forEach((date) => {
    const header = document.createElement("div");
    header.className = "grid-header";

    const dayName = document.createElement("strong");
    dayName.textContent = shortWeekdayNames[date.getDay()];

    const dateText = document.createElement("span");
    dateText.textContent = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

    header.append(dayName, dateText);
    elements.calendarGrid.append(header);
  });

  SLOT_TIMES.forEach((time) => {
    const timeLabel = document.createElement("div");
    timeLabel.className = "time-label";
    timeLabel.textContent = time;
    elements.calendarGrid.append(timeLabel);

    days.forEach((date) => {
      const dateISO = toISODate(date);
      const bookings = findBookingsAt(dateISO, time).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
      const button = document.createElement("button");
      button.type = "button";
      button.className = `slot-button ${bookings.length ? "busy" : "free"}`;
      button.dataset.date = dateISO;
      button.dataset.time = time;

      if (dateISO === state.selectedDate && time === state.selectedTime) {
        button.classList.add("selected");
      }

      button.addEventListener("click", (event) => {
        const entry = event.target.closest("[data-booking-id]");
        selectSlot(dateISO, time, state.isAdmin && entry ? entry.dataset.bookingId : null);
      });

      if (!bookings.length) {
        const timeEl = document.createElement("span");
        timeEl.className = "slot-time";
        timeEl.textContent = `${time} livre`;

        const nameEl = document.createElement("span");
        nameEl.className = "slot-name";
        nameEl.textContent = "Aberto";

        const specialtyEl = document.createElement("span");
        specialtyEl.className = "slot-specialty";
        specialtyEl.textContent = "Salas 1 a 4";

        button.append(timeEl, nameEl, specialtyEl);
      } else {
        const entries = document.createElement("span");
        entries.className = "slot-entries";

        bookings.forEach((booking) => {
          const type = bookingTypeInfo(booking.bookingType);
          const entry = document.createElement("span");
          entry.className = `slot-entry ${type.cssClass}`;
          entry.dataset.bookingId = booking.id;

          const meta = document.createElement("span");
          meta.className = "slot-entry-meta";
          meta.textContent = `${formatBookingRange(booking)} | sala ${booking.roomNumber}`;

          const name = document.createElement("span");
          name.className = "slot-entry-name";
          name.textContent = booking.time === time ? booking.professional : "Em uso";

          const detail = document.createElement("span");
          detail.className = "slot-entry-detail";
          detail.textContent =
            booking.time === time
              ? `${booking.customerName ? `Cliente: ${booking.customerName} - ` : ""}${type.label} - ${booking.specialty}`
              : `${booking.professional} - ${booking.customerName ? `${booking.customerName} - ` : ""}${type.label}`;

          entry.append(meta, name, detail);
          entries.append(entry);
        });

        button.append(entries);
      }
      elements.calendarGrid.append(button);
    });
  });
}

function findConflicts(date, time, duration, roomNumber, ignoreId = null) {
  const start = toMinutes(time);
  const end = start + duration;

  return state.bookings.filter((booking) => {
    if (booking.id === ignoreId || booking.date !== date || booking.roomNumber !== roomNumber) {
      return false;
    }
    const bookedStart = toMinutes(booking.time);
    const bookedEnd = bookedStart + Number(booking.duration);
    return start < bookedEnd && end > bookedStart;
  });
}

function findBookingsAt(date, time) {
  const slot = toMinutes(time);
  return state.bookings.filter((booking) => {
    if (booking.date !== date) {
      return false;
    }
    const start = toMinutes(booking.time);
    const end = start + Number(booking.duration);
    return slot >= start && slot < end;
  });
}

function findBookingForRoomAt(date, time, roomNumber) {
  return findBookingsAt(date, time).find((booking) => booking.roomNumber === roomNumber);
}

function getActiveBooking() {
  if (state.editingId) {
    return state.bookings.find((booking) => booking.id === state.editingId);
  }

  const selected = findBookingForRoomAt(state.selectedDate, state.selectedTime, getCheckedValue("roomNumber", "1"));
  if (selected) {
    return selected;
  }

  if (state.lastBookingId) {
    return state.bookings.find((booking) => booking.id === state.lastBookingId);
  }

  return null;
}

function updateGoogleButtons() {
  const booking = getActiveBooking();
  const hasBooking = Boolean(booking);
  elements.openGoogleButton.disabled = !hasBooking;
  elements.downloadIcsButton.disabled = !hasBooking;

  if (!booking) {
    setIntegrationNotice(
      "Obrigatório: depois de reservar, clique em Abrir no Google e salve o evento na agenda contato.dequilibrio@gmail.com.",
      "pending",
    );
    return;
  }

  const type = bookingTypeInfo(booking.bookingType);
  setIntegrationNotice(
    `Pendente: ${booking.professional}, sala ${booking.roomNumber}, ${type.label}. Clique em Abrir no Google e salve o evento para concluir.`,
    "required",
  );
}

function openGoogleCalendar() {
  const booking = getActiveBooking();
  if (!booking) {
    showToast("Selecione uma reserva.");
    return;
  }
  window.open(buildGoogleCalendarUrl(booking), "_blank", "noopener,noreferrer");
  setIntegrationNotice(
    `Google aberto. Para concluir, salve o evento na agenda ${OWNER_EMAIL}.`,
    "active",
  );
  showToast("Finalize salvando no Google Agenda.");
}

function downloadIcsFile() {
  const booking = getActiveBooking();
  if (!booking) {
    showToast("Selecione uma reserva.");
    return;
  }

  const blob = new Blob([buildIcsContent(booking)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reserva-${booking.date}-${booking.time.replace(":", "h")}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Arquivo .ics gerado.");
}

function buildGoogleCalendarUrl(booking) {
  const start = bookingDate(booking);
  const end = addMinutes(start, Number(booking.duration));
  const type = bookingTypeInfo(booking.bookingType);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${type.label} - Sala ${booking.roomNumber} - ${booking.professional}`,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    ctz: TIME_ZONE,
    details: [
      `Profissional: ${booking.professional}`,
      booking.customerName ? `Cliente: ${booking.customerName}` : "",
      `Sala: ${booking.roomNumber}`,
      `Tipo: ${type.label}`,
      `Cor sugerida: ${type.colorName}`,
      `Especialidade: ${booking.specialty}`,
      booking.notes ? `Observação: ${booking.notes}` : "",
      `Agenda do dono: ${OWNER_EMAIL}`,
    ]
      .filter(Boolean)
      .join("\n"),
    location: `${state.settings.roomName} - Sala ${booking.roomNumber}`,
    color: type.googleColorId,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsContent(booking) {
  const start = bookingDate(booking);
  const end = addMinutes(start, Number(booking.duration));
  const type = bookingTypeInfo(booking.bookingType);
  const summary = `${type.label} - Sala ${booking.roomNumber} - ${booking.professional}`;
  const description = [
    `Profissional: ${booking.professional}`,
    booking.customerName ? `Cliente: ${booking.customerName}` : "",
    `Sala: ${booking.roomNumber}`,
    `Tipo: ${type.label}`,
    `Cor sugerida: ${type.colorName}`,
    `Especialidade: ${booking.specialty}`,
    booking.notes ? `Observação: ${booking.notes}` : "",
    `Agenda do dono: ${OWNER_EMAIL}`,
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ponto de Equilibrio//Agenda Publica//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@ponto-equilibrio`,
    `DTSTAMP:${formatUtcDate(new Date())}`,
    `DTSTART;TZID=${TIME_ZONE}:${formatIcsLocalDate(start)}`,
    `DTEND;TZID=${TIME_ZONE}:${formatIcsLocalDate(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(`${state.settings.roomName} - Sala ${booking.roomNumber}`)}`,
    `COLOR:${type.hex}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function setSlotMessage(message, tone = "") {
  elements.slotMessage.textContent = message;
  elements.slotMessage.classList.toggle("warning", tone === "warning");
  elements.slotMessage.classList.toggle("success", tone === "success");
}

function setIntegrationNotice(message, tone = "") {
  elements.integrationNotice.textContent = message;
  elements.integrationNotice.classList.toggle("required", tone === "required");
  elements.integrationNotice.classList.toggle("active", tone === "active");
  elements.integrationNotice.classList.toggle("pending", tone === "pending");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2600);
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatBookingRange(booking) {
  const start = bookingDate(booking);
  const end = addMinutes(start, Number(booking.duration));
  return `${booking.time} às ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

function formatDateLong(dateISO) {
  if (!dateISO) {
    return "Data";
  }
  const date = parseDate(dateISO);
  return `${weekdayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}`;
}

function bookingDate(booking) {
  const [year, month, day] = booking.date.split("-").map(Number);
  const [hours, minutes] = booking.time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + offset);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatGoogleDate(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function formatIcsLocalDate(date) {
  return formatGoogleDate(date);
}

function formatUtcDate(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcs(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function nextAvailableTime() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return SLOT_TIMES.find((time) => toMinutes(time) > currentMinutes) || SLOT_TIMES[0];
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `booking-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
