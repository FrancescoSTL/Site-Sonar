document.addEventListener('DOMContentLoaded', function() {
	var sendDataCheckbox = document.getElementById('sendCheckbox');
	var deleteDataButton = document.getElementById('deleteButton');

	chrome.storage.local.get('sendData', function (result) {
		if (result.sendData || typeof result.sendData === 'undefined') {
			sendDataCheckbox.checked = true;
		}

		sendDataCheckbox.addEventListener('click', function (event) {
			if(result.sendData === false) {
				chrome.storage.local.set({ "sendData": true });
			} else {
				chrome.storage.local.set({ "sendData": false });
			}
		});
	});

	deleteDataButton.addEventListener('click', function (event) {
		chrome.storage.local.clear(function () {
		    if (chrome.runtime.lastError) {
                deleteDataButton.insertAdjacentHTML("afterend", "<p>Delete Unsuccessful - " + chrome.runtime.lastError + "</p>");
            } else {
                deleteDataButton.insertAdjacentHTML("afterend", "<p>Sucessfully Deleted!</p>");
                deleteDataButton.disabled = true;
            }
		})
	});
});
