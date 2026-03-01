/* ================================
   STAFF ACCOUNTS
================================ */
const staffAccounts = [
  { id: 'STAFF01', password: '1234', name: 'Bhuvan' },
  { id: 'STAFF02', password: 'abcd', name: 'Chirag Bhat' },
  { id: 'STAFF03', password: 'pass', name: 'Chirag GC' },
  { id: 'STAFF04', password: 'word', name: 'Bhargav D' }
];

/* ================================
   REGISTRATION (Citizen)
================================ */
function sendRegisterOtp() {
  const phone = document.getElementById('regPhone').value.trim();
  if (!phone) {
    alert('Enter phone number');
    return;
  }
  if (phone.length !== 10 || isNaN(phone)) {
    alert('Enter valid 10-digit phone number');
    return;
  }
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  localStorage.setItem('reg_pending_phone', phone);
  localStorage.setItem('reg_pending_otp', otp);

  alert('Dummy OTP : ' + otp);
  document.getElementById('regOtp').value = otp;
}

function completeRegistration() {
  const phone = document.getElementById('regPhone').value.trim();
  const otp = document.getElementById('regOtp').value.trim();

  const pendingPhone = localStorage.getItem('reg_pending_phone');
  const pendingOtp = localStorage.getItem('reg_pending_otp');

  if (!phone || !otp) {
    alert('Enter phone and OTP');
    return;
  }

  if (phone !== pendingPhone || otp !== pendingOtp) {
    alert('Invalid phone or OTP');
    return;
  }

  localStorage.setItem('registered_phone', phone);
  localStorage.removeItem('reg_pending_phone');
  localStorage.removeItem('reg_pending_otp');

  alert('Registration successful!');
  window.location = 'citizen_login.html';
}

/* ================================
   LOGIN (Citizen)
================================ */
function sendLoginOtp() {
  const phone = document.getElementById('loginPhone').value.trim();
  const registered = localStorage.getItem('registered_phone');

  if (!phone) {
    alert('Enter phone number');
    return;
  }

  if (phone !== registered) {
    alert('Phone not registered');
    return;
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  localStorage.setItem('login_pending_phone', phone);
  localStorage.setItem('login_pending_otp', otp);

  alert('Dummy Login OTP : ' + otp);
  document.getElementById('loginOtp').value = otp;
}

function completeLogin() {
  const phone = document.getElementById('loginPhone').value.trim();
  const otp = document.getElementById('loginOtp').value.trim();

  const pendingPhone = localStorage.getItem('login_pending_phone');
  const pendingOtp = localStorage.getItem('login_pending_otp');

  if (phone !== pendingPhone || otp !== pendingOtp) {
    alert('Invalid OTP');
    return;
  }

  localStorage.setItem('current_citizen', phone);
  localStorage.removeItem('login_pending_phone');
  localStorage.removeItem('login_pending_otp');

  alert('Login successful');
  window.location = 'citizen_home.html';
}

/* ================================
   STAFF LOGIN
================================ */
function staffLogin() {
  const id = document.getElementById('staffId').value.trim();
  const pass = document.getElementById('staffPass').value.trim();

  const staff = staffAccounts.find(
    s => s.id === id && s.password === pass
  );

  if (!staff) {
    alert('Invalid staff credentials');
    return;
  }

  localStorage.setItem('current_staff', JSON.stringify(staff));
  alert('Staff login successful');
  window.location = 'staff_home.html';
}

/* ================================
   RAISE COMPLAINT
================================ */
function raiseComplaint() {
  const type = document.getElementById("type").value;
  const location = document.getElementById("location").value;
  const file = document.getElementById("image").files[0];

  if (!location) {
    alert("Please enter location");
    return;
  }

  if (!file) {
    alert("Please upload an image");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");

    complaints.push({
      citizen: localStorage.getItem("current_citizen"),
      type: type,
      location: location,
      image: reader.result,
      status: "Pending",
      staffProof: "",
      feedback: "",
      rating: ""
    });

    localStorage.setItem("complaints", JSON.stringify(complaints));
    alert("Complaint submitted successfully!");
    window.location = "my_complaints.html";
  };

  reader.readAsDataURL(file);
}

/* ================================
   VIEW MY COMPLAINTS
================================ */
function loadMyComplaints() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
  const currentCitizen = localStorage.getItem("current_citizen");

  const myComplaints = complaints.filter(c => c.citizen === currentCitizen);

  if (myComplaints.length === 0) {
    list.innerHTML = '<p class="small">No complaints yet.</p>';
    return;
  }

  myComplaints.forEach(c => {
    list.innerHTML += `
      <div class="card">
        <b>${c.type}</b><br>
        Location: ${c.location}<br>
        <span class="status ${c.status.toLowerCase().replace(" ", "")}">
          ${c.status}
        </span><br><br>
        
        <p><strong>Your Uploaded Image:</strong></p>
        <img src="${c.image}">
        
        ${c.staffProof ? `
          <p><strong>Staff Work Proof:</strong></p>
          <img src="${c.staffProof}">
        ` : '<p class="small" style="color: #999;"></p>'}
        
        ${c.feedback ? `
          <div class="feedback-display">
            <p><strong>Your Feedback:</strong></p>
            <p>${c.feedback}</p>
            <p><strong>Rating:</strong> ${'⭐'.repeat(parseInt(c.rating))}</p>
          </div>
        ` : ''}
      </div>
    `;
  });
}

/* ================================
   STAFF: VIEW ALL COMPLAINTS
================================ */
function loadAllComplaints() {
  const all = document.getElementById("all");
  all.innerHTML = "";

  const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");

  if (complaints.length === 0) {
    all.innerHTML = '<p class="small">No complaints yet.</p>';
    return;
  }

  complaints.forEach((c, i) => {
    all.innerHTML += `
      <div class="card">
        <b>${c.type}</b><br>
        Location: ${c.location}<br>
        Citizen: ${c.citizen}<br>
        Status: <strong>${c.status}</strong><br><br>
        
        <p><strong>Citizen Image:</strong></p>
        <img src="${c.image}">

        ${c.staffProof ? `
          <p><strong>Staff Proof (Already Uploaded):</strong></p>
          <img src="${c.staffProof}">
        ` : '<p class="small" style="color: #999;"></p>'}



        <strong>Update Status:</strong><br>
        <button onclick="updateStatus(${i}, 'Pending')">Pending</button>
        <button onclick="updateStatus(${i}, 'In Progress')">In Progress</button>
        <button onclick="updateStatus(${i}, 'Completed')">Completed</button>
        
        ${c.feedback ? `
          <br><br>
          <div style="background: #f0f0f0; padding: 10px; border-radius: 8px;">
            <strong>Citizen Feedback:</strong><br>
            ${c.feedback}<br>
            <strong>Rating:</strong> ${'⭐'.repeat(parseInt(c.rating))}
          </div>
        ` : ''}
      </div>
    `;
  });
}



/* ================================
   UPDATE STATUS
================================ */
function updateStatus(index, status) {
  const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
  
  if (complaints[index]) {
    complaints[index].status = status;
    localStorage.setItem("complaints", JSON.stringify(complaints));
    alert("Status updated to: " + status);
    loadAllComplaints();
  } else {
    alert("Error updating status");
  }
}

/* ================================
   LOAD COMPLETED COMPLAINTS (Feedback)
================================ */
function loadCompletedComplaints() {
  const container = document.getElementById("completed-complaints");
  container.innerHTML = "";

  const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
  const currentCitizen = localStorage.getItem("current_citizen");

  let found = false;

  complaints.forEach((c, i) => {
    if (c.citizen === currentCitizen && c.status === "Completed") {
      found = true;

      container.innerHTML += `
        <div class="card">
          <b>${c.type}</b><br>
          ${c.location}<br>
          <img src="${c.image}"><br><br>

          <textarea id="feedback-${i}" placeholder="Write feedback">${c.feedback}</textarea>

          <select id="rating-${i}">
            <option value="">Select Rating</option>
            <option value="1" ${c.rating=="1"?"selected":""}>⭐</option>
            <option value="2" ${c.rating=="2"?"selected":""}>⭐⭐</option>
            <option value="3" ${c.rating=="3"?"selected":""}>⭐⭐⭐</option>
            <option value="4" ${c.rating=="4"?"selected":""}>⭐⭐⭐⭐</option>
            <option value="5" ${c.rating=="5"?"selected":""}>⭐⭐⭐⭐⭐</option>
          </select>

          <button onclick="submitFeedback(${i})">Submit Feedback</button>
        </div>
      `;
    }
  });

  if (!found) {
    container.innerHTML = "<p>No completed complaints yet.</p>";
  }
}

/* ================================
   SUBMIT FEEDBACK
================================ */
function submitFeedback(index) {
  const feedback = document.getElementById("feedback-" + index).value.trim();
  const rating = document.getElementById("rating-" + index).value;

  if (!feedback || !rating) {
    alert("Please give feedback and rating");
    return;
  }

  const complaints = JSON.parse(localStorage.getItem("complaints"));
  complaints[index].feedback = feedback;
  complaints[index].rating = rating;

  localStorage.setItem("complaints", JSON.stringify(complaints));
  alert("Feedback submitted successfully!");
  location.reload();
}