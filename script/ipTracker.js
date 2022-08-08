import {API_KEY} from './config.js';

function IpTracker()
{
    this.map = null; //The leaflet map.
    this.init();
    
}

IpTracker.prototype.init = function ()
{
    this.initMap();
};

/**
 * Initialises the Leaflet map;
 */
IpTracker.prototype.initMap = function ()
{
    this.map = L.map('map').setView([39.4640585,-3.5306775], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
};


let appTracker = new IpTracker();
