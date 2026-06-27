let map;
let tempLatLng = null;

// INITIALIZE MAP
window.onload = function () {
    map = L.map('map').setView([52.3867, 4.9643], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    map.on('click', onMapClick);

    loadMarkers();
};

// CLICK ON MAP → OPEN FORM
function onMapClick(e) {
    tempLatLng = e.latlng;
    document.getElementById("form").style.display = "block";
}

// CLOSE FORM
function closeForm() {
    document.getElementById("form").style.display = "none";
}

// SAVE MARKER
function saveMarker() {
    let species = document.getElementById("species").value;
    let date = document.getElementById("date").value;
    let time = document.getElementById("time").value;
    let file = document.getElementById("photo").files[0];

    if (!tempLatLng) return;

    let reader = new FileReader();

    reader.onload = function (e) {
        let photoData = e.target.result || null;

        let markerData = {
            lat: tempLatLng.lat,
            lng: tempLatLng.lng,
            species: species,
            date: date,
            time: time,
            photo: photoData
        };

        // SAVE LOCALLY
        let saved = JSON.parse(localStorage.getItem("markers") || "[]");
        saved.push(markerData);
        localStorage.setItem("markers", JSON.stringify(saved));

        // ADD TO MAP
        addMarkerToMap(markerData);

        // SYNC TO GOOGLE SHEETS
        syncToSheets(markerData);

        // RESET FORM
        document.getElementById("species").value = "";
        document.getElementById("date").value = "";
        document.getElementById("time").value = "";
        document.getElementById("photo").value = "";
        closeForm();
    };

    if (file) {
        reader.readAsDataURL(file);
    } else {
        // no photo
        let markerData = {
            lat: tempLatLng.lat,
            lng: tempLatLng.lng,
            species: species,
            date: date,
            time: time,
            photo: null
        };

        let saved = JSON.parse(localStorage.getItem("markers") || "[]");
        saved.push(markerData);
        localStorage.setItem("markers", JSON.stringify(saved));

        addMarkerToMap(markerData);
        syncToSheets(markerData);
        closeForm();
    }
}

// ADD MARKER TO MAP WITH POPUP
function addMarkerToMap(m) {
    let popupHtml = `<b>${m.species}</b><br>${m.date} ${m.time}`;
    if (m.photo) {
        popupHtml += `<br><img src="${m.photo}" width="150">`;
    }

    L.marker([m.lat, m.lng])
        .addTo(map)
        .bindPopup(popupHtml);
}

// LOAD SAVED MARKERS ON START
function loadMarkers() {
    let saved = JSON.parse(localStorage.getItem("markers") || "[]");
    saved.forEach(addMarkerToMap);
}

// EXPORT CSV
function exportCSV() {
    let markers = JSON.parse(localStorage.getItem("markers") || "[]");

    let csv = "lat,lng,species,date,time\n";
    markers.forEach(m => {
        csv += `${m.lat},${m.lng},${m.species},${m.date},${m.time}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "markers.csv";
    a.click();
}

// SYNC TO GOOGLE SHEETS
function syncToSheets(markerData) {
    const url = "https://script.google.com/macros/s/AKfycbxlIZPwLgZNhUpLPrZ0tB77Un_X1MqTgcU5u4vD6bF537UGql75MRyrkIQBeQJsDiNjcA/exec"; // <-- put your script URL here

    fetch(url, {
        method: "POST",
        body: JSON.stringify(markerData)
    }).catch(err => {
        console.log("Sheets sync error:", err);
    });
}

// GPS AUTO-LOCATE
function locateMe() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        let lat = pos.coords.latitude;
        let lng = pos.coords.longitude;

        map.setView([lat, lng], 18);

        L.circle([lat, lng], {
            radius: 5,
            color: "blue"
        }).addTo(map);
    }, err => {
        alert("Could not get location");
        console.log(err);
    });
}
