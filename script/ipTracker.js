import {API_KEY} from './config.js';
import {GEOIPFY_URI} from './config.js';
import {MAP_ZOOM} from './config.js';

function IpTracker()
{
    this.map = null; //The leaflet map.
    this.marker = null; //The marker
    this.form = document.querySelector('.form-tracker');
    this.errorMessageContainer = document.querySelector('.error-message');
    this.spinnerLoader = document.querySelector('.loader-container');
    this.boxIPresult = document.querySelector('.ipaddress-info');
    this.init();
}

IpTracker.prototype.init = function ()
{
    this.form.addEventListener('submit', this.submitForm.bind(this));
    this.checkIPAndPerformRequest();
};

/**
 * Shows the spinner loader.
 */
IpTracker.prototype.showSpinner = function ()
{
    this.spinnerLoader.classList.add('show-loader');
};

/**
 * Hides the spinner loader.
 */
IpTracker.prototype.hideSpinner = function ()
{
    this.spinnerLoader.classList.remove('show-loader');
};

/**
 * Performs the request to the remote server
 * 
 * @param {String} ipAddress The IP address to get the information from. 
 * @param {String} domain The domain to get the information from. 
 * @return the response from the server
 */
IpTracker.prototype.performRequest = async function (ipAddress = '', domain = '')
{
    try
    {
        return await fetch(GEOIPFY_URI + '?apiKey=' + API_KEY + '&ipAddress=' + ipAddress + '&domain=' + domain);
    }
    catch (Error)
    {
        throw "Could not connect to the server";
    }
};

/**
 * Deletes all the data currently displayed in the box with the information about the IP.
 * 
 */
IpTracker.prototype.clearInformationBox = function ()
{
    this.boxIPresult.querySelectorAll('.data-info').forEach(dataItem => dataItem.classList.remove('textFadeIn'));
};

/**
 * Checks the validity of the IP passed as a parameter. If it is valid, then perform the request to track its information.
 * 
 * @param {type} ipAddress The IP address to get information from.
 */
IpTracker.prototype.checkIPAndPerformRequest = async function (ipAddress = '')
{
    try
    {
        this.showSpinner();
        this.clearInformationBox();
        let result = null;

        if (ipAddress.length > 0)
        {
            if (this.checkValidIp(ipAddress))
            {
                result = await this.performRequest(ipAddress);
            }
            else if (this.checkValidDomain(ipAddress))
            {
                result = await this.performRequest('', ipAddress);
            }
            else
            {
                throw "Invalid IP or domain";
            }
        }
        else
        {
            result = await this.performRequest(); //This will get the client IP address
        }

        if (result.status !== 200)
        {
            throw "Server returned an error.";
        }

        const jsonResult = await result.json();

        this.showIPInformation(jsonResult);
        this.showIPMapLocation([jsonResult.location.lat, jsonResult.location.lng]);
        this.hideErrorBox();
        this.cleanForm();
    }
    catch (error)
    {
        this.showErrorBox(error);
    }
    finally
    {
        this.hideSpinner();
    }
};

/**
 * Submits the form with the IP to track.
 * 
 * @param {type} event
 */
IpTracker.prototype.submitForm = async function (event)
{
    event.preventDefault();
    await this.checkIPAndPerformRequest(new FormData(this.form).get('ip-address'));
};

/**
 * Fills some HTML elements with the information of an IP address. 
 * 
 * @param {Object} jsonInfo The object with all the information about an IP address.
 */
IpTracker.prototype.showIPInformation = function (jsonInfo)
{
    this.boxIPresult.querySelector('[data-ip-info]').textContent = jsonInfo.ip;
    this.boxIPresult.querySelector('[data-location-info]').textContent = jsonInfo.location.city + ", "
            + jsonInfo.location.region + " " + jsonInfo.location.postalCode;
    this.boxIPresult.querySelector('[data-timezone-info]').textContent = jsonInfo.location.timezone;
    this.boxIPresult.querySelector('[data-isp-info]').textContent = jsonInfo.isp;

    this.boxIPresult.querySelectorAll('.data-info').forEach(dataItem => dataItem.classList.add('textFadeIn'));
};

/**
 * Shows the latitude and longitude of the tracked IP address.
 * 
 * @param {Array} lat_long_array An array with the latitude and longitude, in the form [lat, lng]
 */
IpTracker.prototype.showIPMapLocation = function (lat_long_array)
{
    if (this.map === null)
    {
        this.map = L.map('map', {zoomControl: false});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        this.marker = L.marker(lat_long_array, {icon: L.icon({
                iconUrl: './images/icon-location.svg',
                iconSize: [46, 56]
            })}).addTo(this.map);
    }
    else
    {
        this.marker.setLatLng(lat_long_array);
    }

    this.map.setView(lat_long_array, MAP_ZOOM);
};

/**
 * Shows the error string passed as a parameter.
 * 
 * @param {type} error
 */
IpTracker.prototype.showErrorBox = function (error)
{
    this.errorMessageContainer.querySelector('.error-message-text').textContent = error;
    this.errorMessageContainer.classList.add('display-error');
};

/**
 * Hides the error message box.
 * 
 */
IpTracker.prototype.hideErrorBox = function ()
{
    this.errorMessageContainer.classList.remove('display-error');
};

/**
 * Clean all the fields of the form.
 * 
 */
IpTracker.prototype.cleanForm = function ()
{
    this.form.querySelectorAll('input').forEach(inputField => inputField.value = '');
};

/**
 * Checks if the parameter 'domain' is a valid domain.
 * 
 * @param {String} domain The domain to check.
 * @return true if the string 'domain' is a valid domain, false otherwise.
 * @note Credits: https://www.w3resource.com/javascript-exercises/javascript-regexp-exercise-18.php
 */
IpTracker.prototype.checkValidDomain = function (domain)
{

    const domainRegexp = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i;

    if (domainRegexp.test(domain))
    {
        return true;
    }

    return false;
};

/**
 * Checks if the parameter 'ipAddress' is a valid IP address.
 * 
 * @param {String} ipAddress The IP address to check.
 * @return true if the string 'ipAddress' is a valid string, false otherwise.
 * @note Credits: https://www.w3resource.com/javascript/form/ip-address-validation.php
 */
IpTracker.prototype.checkValidIp = function (ipAddress)
{
    const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipAddress.match(ipformat))
    {
        return true;
    }

    return false;
};

let appTracker = new IpTracker();
