module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = __webpack_require__(1);
exports.handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    let bucketName = "social-confidence";
    if (isCustomEvent(event)) {
        bucketName = event.bucketName;
    }
    else {
        if (event.detail["bucketName"] !== undefined)
            bucketName = event.detail["bucketName"];
    }
    let handler = new handler_1.DiseaseListHandler(bucketName);
    yield handler.updateDiseasesForAllCountries();
});
function isCustomEvent(evt) {
    return evt.bucketName !== undefined;
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = __importStar(__webpack_require__(2));
const s3 = new AWS.S3();
class DiseaseListHandler {
    constructor(bucketName) {
        this.bucketName = bucketName;
    }
    updateDiseasesForAllCountries() {
        return __awaiter(this, void 0, void 0, function* () {
            //get a list of countries with disease files
            let listObjectResult = null;
            let diseasesAndCountries = [];
            do {
                listObjectResult = yield s3.listObjectsV2({ Bucket: this.bucketName, Prefix: "api/countries/" }).promise();
                if (listObjectResult.Contents) {
                    for (let item of listObjectResult.Contents) {
                        let capturingRegex = new RegExp("api\/countries\/(?<countryCode>[^\/]+)\/diseases\/(?<disease>.*)\.json", "gim");
                        let match = capturingRegex.exec(item.Key);
                        if (match && match.groups && match.groups["disease"] != "diseases") {
                            let country = diseasesAndCountries.find(dc => dc.countryCode == (match === null || match === void 0 ? void 0 : match.groups)["countryCode"]);
                            if (country == undefined) {
                                country = {
                                    countryCode: (match === null || match === void 0 ? void 0 : match.groups)["countryCode"],
                                    diseases: []
                                };
                                diseasesAndCountries.push(country);
                            }
                            country.diseases.push(match.groups["disease"]);
                        }
                    }
                }
            } while (listObjectResult != null && listObjectResult.IsTruncated);
            for (const item of diseasesAndCountries) {
                yield this.updateDiseaseListForCountry(item.countryCode, item.diseases);
            }
        });
    }
    updateDiseaseListForCountry(countryCode, diseases) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `api/countries/${countryCode}/diseases/diseases.json`;
            const diseaseFormat = diseases.map(disease => { return { name: disease }; });
            try {
                yield s3.putObject({
                    Bucket: this.bucketName,
                    Key: key,
                    ACL: 'public-read',
                    Body: JSON.stringify(diseaseFormat)
                }).promise();
            }
            catch (error) {
                debugger;
                console.error(error);
            }
        });
    }
}
exports.DiseaseListHandler = DiseaseListHandler;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ })
/******/ ]);