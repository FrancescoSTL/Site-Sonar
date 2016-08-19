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
		chrome.runtime.sendMessage({ "deleteOverview": true }, function (response) {
			chrome.storage.local.clear(function () {
			    if (chrome.runtime.lastError && !response.deletedOverview) {
	                deleteDataButton.insertAdjacentHTML("afterend", "<p>Delete Unsuccessful - " + escapeHTML(chrome.runtime.lastError) + "</p>");
	            } else {
	                deleteDataButton.insertAdjacentHTML("afterend", "<p>Sucessfully Deleted!</p>");
	                deleteDataButton.disabled = true;
	                sendDataCheckbox.checked = true;
	            }
			});
		});
	});
});

function escapeHTML(str){
	return str.replace(/[&"'<>]/g, (m) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[m]);
}
