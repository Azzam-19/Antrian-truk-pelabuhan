 const App = (() => {
      // Data storage (in-memory)
      let queueData = [];
      let currentDriverId = null;
      let queueCounter = 1;

      // ============ UTILITY FUNCTIONS ============

      function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
          notification.classList.remove('show');
        }, 3000);
      }

      function getElementById(id) {
        return document.getElementById(id);
      }

      // ============ PAGE NAVIGATION ============

      function switchPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        
        getElementById(pageId).classList.add('active');
        event.target.classList.add('active');
        
        if (pageId === 'driver-dashboard') {
          updateDriverDashboard();
        } else if (pageId === 'officer-dashboard') {
          updateOfficerDashboard();
        }
      }

      // ============ DRIVER FUNCTIONS ============

      function registerDriver(event) {
        event.preventDefault();
        
        const vehicleNumber = getElementById('vehicleNumber').value.trim();
        const driverName = getElementById('driverName').value.trim();
        const phoneNumber = getElementById('phoneNumber').value.trim();
        
        if (!vehicleNumber || !driverName || !phoneNumber) {
          showNotification('Silakan isi semua kolom!', 'error');
          return;
        }
        
        const newDriver = {
          id: Date.now(),
          queueNumber: queueCounter++,
          vehicleNumber: vehicleNumber,
          driverName: driverName,
          phoneNumber: phoneNumber,
          status: 'Waiting',
          registeredAt: new Date().toLocaleString()
        };
        
        queueData.push(newDriver);
        currentDriverId = newDriver.id;
        
  showNotification('Berhasil terdaftar! Nomor antrian: ' + newDriver.queueNumber);
        
        // Reset form
        getElementById('driverForm').reset();
        
        // Switch to driver dashboard
        setTimeout(() => {
          document.querySelectorAll('.nav-tab')[1].click();
        }, 1500);
      }

      function updateDriverDashboard() {
        if (!currentDriverId) {
          getElementById('driverQueueNumber').textContent = '-';
          getElementById('queueStatus').textContent = 'Silakan mendaftar terlebih dahulu';
          getElementById('driverNameDisplay').textContent = '-';
          getElementById('vehicleNumberDisplay').textContent = '-';
          getElementById('phoneNumberDisplay').textContent = '-';
          getElementById('statusBadge').innerHTML = '-';
          return;
        }
        
        const driver = queueData.find(d => d.id === currentDriverId);
        
        if (!driver) {
          currentDriverId = null;
          updateDriverDashboard();
          return;
        }
        
        getElementById('driverQueueNumber').textContent = driver.queueNumber;
        getElementById('driverNameDisplay').textContent = driver.driverName;
        getElementById('vehicleNumberDisplay').textContent = driver.vehicleNumber;
        getElementById('phoneNumberDisplay').textContent = driver.phoneNumber;
        
  let statusClass = 'status-waiting';
  let statusText = '⏳ Menunggu';
        
        if (driver.status === 'Called') {
          statusClass = 'status-called';
          statusText = '📢 Dipanggil - Silakan menuju gerbang!';
          getElementById('queueStatus').textContent = '🚨 Giliran Anda sekarang!';
        } else if (driver.status === 'Checked') {
          statusClass = 'status-checked';
          statusText = '✅ Terverifikasi';
          getElementById('queueStatus').textContent = '✅ Kendaraan terverifikasi!';
        } else if (driver.status === 'Completed') {
          statusClass = 'status-completed';
          statusText = '✔️ Selesai';
          getElementById('queueStatus').textContent = '✔️ Proses selesai!';
        } else {
          const position = queueData.filter(d => d.status === 'Waiting').findIndex(d => d.id === driver.id) + 1;
          getElementById('queueStatus').textContent = position <= 3 ? '⚡ Antrian Anda mendekat!' : '⏰ Mohon tunggu giliran Anda';
        }
        
        getElementById('statusBadge').innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
      }

      function logoutDriver() {
        if (confirm('Anda yakin ingin keluar?')) {
          currentDriverId = null;
          showNotification('Berhasil keluar');
          document.querySelectorAll('.nav-tab')[0].click();
        }
      }

      // ============ OFFICER FUNCTIONS ============

      function updateOfficerDashboard() {
        const tbody = getElementById('queueTableBody');
        
        if (queueData.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div>Belum ada kendaraan dalam antrian</div>
              </td>
            </tr>
          `;
        } else {
          tbody.innerHTML = queueData.map(driver => `
            <tr>
              <td><strong>${driver.queueNumber}</strong></td>
              <td>${driver.driverName}</td>
              <td>${driver.vehicleNumber}</td>
              <td>${driver.phoneNumber}</td>
              <td>
                <span class="status-badge status-${driver.status.toLowerCase()}">
                  ${driver.status === 'Waiting' ? '⏳' : driver.status === 'Called' ? '📢' : driver.status === 'Checked' ? '✅' : '✔️'}
                  ${driver.status === 'Waiting' ? 'Menunggu' : driver.status === 'Called' ? 'Dipanggil' : driver.status === 'Checked' ? 'Terverifikasi' : 'Selesai'}
                </span>
              </td>
              <td>
                ${driver.status === 'Waiting' ? `<button class="action-btn btn-call" onclick="App.updateStatus(${driver.id}, 'Called')">Panggil</button>` : ''}
                ${driver.status === 'Called' ? `<button class="action-btn btn-verify" onclick="App.updateStatus(${driver.id}, 'Checked')">Verifikasi</button>` : ''}
                ${driver.status === 'Checked' ? `<button class="action-btn btn-complete" onclick="App.updateStatus(${driver.id}, 'Completed')">Selesai</button>` : ''}
              </td>
            </tr>
          `).join('');
        }
        
        // Update statistics
        getElementById('totalQueues').textContent = queueData.length;
        getElementById('waitingQueues').textContent = queueData.filter(d => d.status === 'Waiting').length;
        getElementById('calledQueues').textContent = queueData.filter(d => d.status === 'Called').length;
        getElementById('completedQueues').textContent = queueData.filter(d => d.status === 'Completed').length;
      }

      function updateStatus(id, newStatus) {
        const driver = queueData.find(d => d.id === id);
        if (driver) {
          driver.status = newStatus;
          updateOfficerDashboard();
          const statusMap = { Waiting: 'Menunggu', Called: 'Dipanggil', Checked: 'Terverifikasi', Completed: 'Selesai' };
          showNotification(`Antrian ${driver.queueNumber} status diubah menjadi ${statusMap[newStatus] || newStatus}`);
        }
      }

      function clearAllData() {
        if (confirm('Anda yakin ingin menghapus semua data antrian? Tindakan ini tidak dapat dikembalikan.')) {
          queueData = [];
          currentDriverId = null;
          queueCounter = 1;
          updateOfficerDashboard();
          showNotification('Semua data berhasil dihapus');
        }
      }

      // ============ AUTO-REFRESH ============

      setInterval(() => {
        if (getElementById('driver-dashboard').classList.contains('active')) {
          updateDriverDashboard();
        }
      }, 3000);

      setInterval(() => {
        if (getElementById('officer-dashboard').classList.contains('active')) {
          updateOfficerDashboard();
        }
      }, 3000);

      // ============ PUBLIC API ============

      return {
        switchPage,
        registerDriver,
        updateDriverDashboard,
        logoutDriver,
        updateOfficerDashboard,
        updateStatus,
        clearAllData
      };
    })();