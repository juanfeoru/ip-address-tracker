const $ipInput = document.getElementById('ip-input');
const $form = document.querySelector('form');
const $ipAddress = document.getElementById('ip-address');
const $ipLocation = document.getElementById('ip-location');
const $ipTimezone = document.getElementById('ip-timezone');
const $ipIsp = document.getElementById('ip-isp');

const map = L.map('map').setView([0, 0], 2);

const API_KEY = 'at_ODynOzSlrxhcRVcqFr9nlwmjBERVG';

const customIcon = L.icon({
  iconUrl: './images/icon-location.svg',
  iconSize: [46, 56],
  iconAnchor: [23, 56],
  popupAnchor: [0, -56],
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

let marker = null;

$form.addEventListener('submit', (e) => {
  e.preventDefault();

  const ipValue = $ipInput.value.trim();

  if (!ipValue) return;

  if (!isValidInput(ipValue)) {
    alert('Please enter a valid IP address or domain');
    return;
  }

  searchIpApi(ipValue);
});

async function searchIpApi(ipValue = '') {
  try {
    const response = await fetch(
      `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&ipAddress=${ipValue}`,
    );

    if (!response.ok) throw new Error(`Unable to fetch IP information`);

    const {
      ip,
      location: { city, timezone, region, postalCode, lat, lng },
      isp,
    } = await response.json();

    const locationText = postalCode
      ? `${city}, ${region} ${postalCode}`
      : `${city}, ${region}`;

    console.log(postalCode);

    $ipAddress.textContent = ip;
    $ipLocation.textContent = locationText;
    $ipTimezone.textContent = `UTC ${timezone}`;
    $ipIsp.textContent = isp || 'Unknown ISP';

    map.flyTo([lat, lng], 16, {
      animate: true,
      duration: 1.5,
    });

    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    }
  } catch (error) {
    console.error(error);
    $ipAddress.textContent = 'Invalid IP or domain';
    $ipIsp.textContent = '—';
    if (marker) {
      map.setView([0, 0], 2);
      marker.remove();
      marker = null;
    }
  }
}

function isValidInput(value) {
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$|^[a-fA-F0-9:]+$/; // IPv4 + IPv6
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return ipRegex.test(value) || domainRegex.test(value);
}

// searchIpApi();
