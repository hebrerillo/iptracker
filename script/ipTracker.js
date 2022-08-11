import {API_KEY} from './config.js';
import {GEOIPFY_URI} from './config.js';

function IpTracker()
{
    this.map = null; //The leaflet map.
    this.form = document.querySelector('.form-tracker');
    this.errorMessageContainer = document.querySelector('.error-message');
    this.spinnerLoader = document.querySelector('.loader-container');
    this.init();
}

IpTracker.prototype.init = function ()
{
    this.initMap();
    this.form.addEventListener('submit', this.submitForm.bind(this));
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
 * @return the response from the server
 */
IpTracker.prototype.performRequest = async function ()
{
    try
    {
        return await fetch(GEOIPFY_URI);
    }
    catch (Error)
    {
        throw "Could not connect to the server";
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

    try
    {
        this.showSpinner();
        let ipAddress = new FormData(this.form).get('ip-address');

        if (!this.checkValidIp(ipAddress))
        {
            throw "Invalid IP";
        }

        let result = await this.performRequest();


        if (result.status !== 200)
        {
            throw "Server returned an error.";
        }

        this.hideErrorBox();
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
 * Checks if the parameter 'ipAddress' is a valid IP address.
 * 
 * @param {String} ipAddress The IP address to check.
 * @return true if the string 'ipAddress' is a valid string, false otherwise.
 * @note Credits: https://www.w3resource.com/javascript/form/ip-address-validation.php
 */
IpTracker.prototype.checkValidIp = function (ipAddress)
{
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipAddress.match(ipformat))
    {
        return true;
    }

    return false;
};

/**
 * Initialises the Leaflet map;
 */
IpTracker.prototype.initMap = function ()
{
    this.map = L.map('map').setView([39.4640585, -3.5306775], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
};


let appTracker = new IpTracker();
