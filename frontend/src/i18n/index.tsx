import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CivicIssueCategory, CivicIssueStatus } from "../services/api";
import type { IssueCategory, IssueStatus } from "../types/issue";

export type Language = "en" | "hi" | "mr";

type InterpolationValues = Record<string, string | number>;

const STORAGE_KEY = "civic-language";

const localeByLanguage: Record<Language, string> = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN"
};

const englishMessages = {
  "navbar.brand": "Civic Issue Tracker",
  "navbar.map": "Map",
  "navbar.issues": "Issues",
  "navbar.primary": "Primary",
  "navbar.notifications": "Notifications",
  "navbar.notificationsAria": "Open notifications",
  "navbar.profile": "Open profile menu",
  "navbar.myProfile": "My Profile",
  "navbar.adminPanel": "Admin Panel",
  "navbar.reportIssue": "+ Report Issue",
  "navbar.language": "Language",
  "navbar.languageEnglish": "English",
  "navbar.languageHindi": "Hindi",
  "navbar.languageMarathi": "Marathi",

  "home.heroTracked": "{count} issues tracked citywide",
  "home.heroTitleLine1": "Report civic issues,",
  "home.heroTitleLine2": "build a better city.",
  "home.heroDescription": "Spotted a pothole, broken streetlight, or overflowing garbage? Report it in seconds and track its progress from report to resolution.",
  "home.reportIssue": "+ Report Issue",
  "home.browseIssues": "Browse Issues",
  "home.totalIssues": "Total Issues",
  "home.pending": "Pending",
  "home.reported": "Reported",
  "home.resolved": "Resolved",
  "home.issueStatsAria": "Issue stats",
  "home.liveIssueMap": "Live Issue Map",
  "home.recentIssues": "Recent Issues",
  "home.viewAll": "View all ->",
  "auth.authorityLogin": "Authority Login",
  "auth.authorityLoginHelp": "Sign in as a city authority to update issue status and manage the admin panel.",
  "auth.registerAuthority": "Register Authority",
  "auth.registerAuthorityHelp": "Create an authority account for municipal issue management.",
  "auth.name": "Name",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.namePlaceholder": "City Admin",
  "auth.passwordPlaceholder": "Enter password",
  "auth.login": "Login",
  "auth.register": "Register",
  "auth.logout": "Logout",
  "auth.loginSuccess": "Login successful. Redirecting...",
  "auth.loginFailed": "Failed to login.",
  "auth.registerFailed": "Failed to register authority account.",
  "auth.needAuthorityAccount": "Need an authority account?",
  "auth.backToLogin": "Back to login",
  "auth.authorityActionNotice": "Only logged-in authorities can update issue status.",
  "admin.title": "Admin Panel",
  "admin.subtitle": "Manage reported issues, monitor stats, and update issue status.",
  "admin.refresh": "Refresh Data",
  "admin.refreshing": "Refreshing...",
  "admin.statsAria": "Admin issue stats",
  "admin.searchPlaceholder": "Search by title, address, category...",
  "admin.loading": "Loading admin data...",
  "admin.loadFailed": "Failed to load admin data.",
  "admin.updateFailed": "Failed to update issue status.",
  "admin.issue": "Issue",
  "admin.votes": "Votes",
  "admin.created": "Created",
  "admin.action": "Action",
  "admin.viewDetails": "View details",
  "admin.save": "Save",
  "admin.saving": "Saving...",
  "admin.noMatches": "No matching issues found.",
  "toast.issueSubmitted": "Issue submitted successfully",

  "issueList.title": "All Issues",
  "issueList.resultCount": "{visible} of {total} issues",
  "issueList.filter": "Filter",
  "issueList.searchPlaceholder": "Search issues...",
  "issueList.status": "Status",
  "issueList.category": "Category",
  "issueList.noIssuesFound": "No issues found",
  "issueList.adjustFilters": "Try adjusting your search or filters.",

  "create.successTitle": "Issue Reported",
  "create.successMessage": "Thanks for helping improve the city. Redirecting to issues list...",
  "create.pageTitle": "Report an Issue",
  "create.pageSubtitle": "Help your city teams respond faster by submitting clear details and location.",
  "create.issueDetails": "Issue Details",
  "create.issueTitle": "Issue Title",
  "create.issueTitlePlaceholder": "Large pothole on Main Street",
  "create.descriptionPlaceholder": "Describe what you observed and any hazards...",
  "create.suggestedCategory": "Suggested: {category}",
  "create.photoMode": "Photo mode",
  "create.photoOptionsHelp": "Drag and drop an image here, or use the upload button.",
  "create.selectImage": "Select an image",
  "create.locationSet": "Location set: {lat}, {lng}",
  "create.resolvingLocation": "Fetching selected city...",
  "create.locationUnavailable": "Selected location saved, but city name is unavailable.",
  "imageUpload.placeholderTitle": "Drop your image here",
  "imageUpload.placeholderHint": "You can also click Upload Image to browse files.",
  "imageUpload.ready": "Image selected",
  "imageUpload.noFile": "No image selected",
  "imageUpload.fileName": "File: {name}",
  "imageUpload.reset": "Remove image",
  "imageUpload.invalidType": "Only image files are allowed.",
  "imageUpload.invalidSize": "Image must be under {max} MB.",

  "issueDetail.missingId": "Missing issue id.",
  "issueDetail.backToIssues": "Back to issues",
  "issueDetail.details": "Issue details",
  "issueDetail.noDescription": "No description provided.",
  "issueDetail.media": "Media",
  "issueDetail.openImage": "Open image",
  "issueDetail.noImage": "No image attached.",
  "issueDetail.assignment": "Assignment",
  "issueDetail.address": "Address",
  "issueDetail.timestamps": "Timestamps",
  "issueDetail.created": "Created",
  "issueDetail.updated": "Updated",
  "issueDetail.alreadyResolved": "This issue is already resolved.",
  "issueDetail.markAs": "Mark as {status}",
  "issueDetail.latitude": "Latitude",
  "issueDetail.longitude": "Longitude",

  "profile.title": "Profile",
  "profile.subtitle": "Review your account details and quick actions.",
  "profile.name": "Name",
  "profile.email": "Email",
  "profile.role": "Role",
  "profile.backToIssues": "Back to issues",

  "modal.closeIssueDetails": "Close issue details",
  "modal.reported": "Reported",

  "map.yourCurrentLocation": "Your current location",
  "map.selectedLocation": "Selected location",
  "mapPicker.locationPicker": "Location picker",
  "mapPicker.hint": "Simple coordinate input for the MVP. A real map can be added later.",

  "common.loadingMap": "Loading map...",
  "common.loadingIssues": "Loading issues...",
  "common.loadingIssue": "Loading issue...",
  "common.description": "Description",
  "common.category": "Category",
  "common.location": "Location",
  "common.photo": "Photo",
  "common.capture": "Capture Image",
  "common.upload": "Upload Image",
  "common.capturePhoto": "Capture Photo",
  "common.captureLocation": "Capture Location",
  "common.retake": "Retake",
  "common.detectMyLocation": "Detect My Location",
  "common.detecting": "Detecting...",
  "common.cancel": "Cancel",
  "common.submitReport": "Submit Report",
  "common.submitting": "Submitting...",
  "common.updated": "Updated",

  "capture.fetchingGps": "Fetching GPS coordinates...",

  "errors.loadIssues": "Failed to load issues",
  "errors.geolocationUnsupported": "Geolocation is not supported by this browser.",
  "errors.detectLocationFailed": "Unable to detect location. Select it manually on the map.",
  "errors.locationRequired": "Please capture or select a location before submitting.",
  "errors.categoryRequired": "Please choose a category.",
  "errors.submitIssueFailed": "Failed to submit issue.",
  "errors.geolocationUnavailable": "Geolocation is not available in this browser.",
  "errors.locationReadFailed": "Could not read location. Enable GPS permissions and retry.",

  "status.all": "All",
  "status.reported": "Reported",
  "status.inProgress": "In Progress",
  "status.resolved": "Resolved",

  "category.all": "All",
  "category.pothole": "Pothole",
  "category.garbage": "Garbage",
  "category.streetlight": "Streetlight",
  "category.flooding": "Flooding",
  "category.graffiti": "Graffiti",
  "category.roadDamage": "Road Damage",
  "category.other": "Other",
  "category.road": "Road",
  "category.water": "Water",
  "category.electricity": "Electricity"
} as const;

type TranslationKey = keyof typeof englishMessages;
type MessageDictionary = Partial<Record<TranslationKey, string>>;

const messages: Record<Language, MessageDictionary> = {
  en: englishMessages,
  hi: {
    "navbar.brand": "नागरिक समस्या ट्रैकर",
    "navbar.map": "मानचित्र",
    "navbar.issues": "समस्याएं",
    "navbar.primary": "मुख्य नेविगेशन",
    "navbar.reportIssue": "+ समस्या दर्ज करें",
    "navbar.language": "भाषा",
    "navbar.languageEnglish": "अंग्रेजी",
    "navbar.languageHindi": "हिंदी",
    "navbar.languageMarathi": "मराठी",

    "home.heroTracked": "शहरभर में {count} समस्याएं दर्ज",
    "home.heroTitleLine1": "नागरिक समस्याएं दर्ज करें,",
    "home.heroTitleLine2": "बेहतर शहर बनाएं।",
    "home.heroDescription": "गड्ढा, खराब स्ट्रीटलाइट या कचरा दिखा? कुछ ही सेकंड में रिपोर्ट करें और स्थिति को रिपोर्ट से समाधान तक ट्रैक करें।",
    "home.reportIssue": "+ समस्या दर्ज करें",
    "home.browseIssues": "समस्याएं देखें",
    "home.totalIssues": "कुल समस्याएं",
    "home.pending": "लंबित",
    "home.reported": "रिपोर्टेड",
    "home.resolved": "समाधान हुआ",
    "home.issueStatsAria": "समस्या आंकड़े",
    "home.liveIssueMap": "लाइव समस्या मानचित्र",
    "home.recentIssues": "हाल की समस्याएं",
    "home.viewAll": "सभी देखें ->",

    "issueList.title": "सभी समस्याएं",
    "issueList.resultCount": "{total} में से {visible} समस्याएं",
    "issueList.filter": "फिल्टर",
    "issueList.searchPlaceholder": "समस्याएं खोजें...",
    "issueList.status": "स्थिति",
    "issueList.category": "श्रेणी",
    "issueList.noIssuesFound": "कोई समस्या नहीं मिली",
    "issueList.adjustFilters": "खोज या फिल्टर बदलकर देखें।",

    "create.successTitle": "समस्या दर्ज हुई",
    "create.successMessage": "शहर को बेहतर बनाने में मदद के लिए धन्यवाद। समस्या सूची पर भेजा जा रहा है...",
    "create.pageTitle": "समस्या दर्ज करें",
    "create.pageSubtitle": "स्पष्ट विवरण और स्थान देकर शहर टीमों को जल्दी प्रतिक्रिया देने में मदद करें।",
    "create.issueDetails": "समस्या विवरण",
    "create.issueTitle": "समस्या शीर्षक",
    "create.issueTitlePlaceholder": "मुख्य सड़क पर बड़ा गड्ढा",
    "create.descriptionPlaceholder": "आपने क्या देखा और क्या खतरा है, उसका विवरण दें...",
    "create.suggestedCategory": "सुझाव: {category}",
    "create.photoMode": "फोटो मोड",
    "create.photoOptionsHelp": "यहां इमेज ड्रैग-ड्रॉप करें या अपलोड बटन का उपयोग करें।",
    "create.selectImage": "छवि चुनें",
    "create.locationSet": "स्थान सेट: {lat}, {lng}",
    "create.resolvingLocation": "चयनित शहर प्राप्त किया जा रहा है...",
    "create.locationUnavailable": "स्थान चयनित है, लेकिन शहर का नाम उपलब्ध नहीं है।",
    "imageUpload.placeholderTitle": "यहां इमेज छोड़ें",
    "imageUpload.placeholderHint": "या फाइल चुनने के लिए फोटो अपलोड करें पर क्लिक करें।",
    "imageUpload.ready": "इमेज चुन ली गई",
    "imageUpload.noFile": "कोई इमेज चयनित नहीं",
    "imageUpload.fileName": "फ़ाइल: {name}",
    "imageUpload.reset": "इमेज हटाएं",
    "imageUpload.invalidType": "सिर्फ इमेज फाइलें मान्य हैं।",
    "imageUpload.invalidSize": "इमेज का आकार {max} MB से कम होना चाहिए।",

    "issueDetail.missingId": "समस्या आईडी नहीं मिली।",
    "issueDetail.backToIssues": "समस्याओं पर वापस जाएं",
    "issueDetail.details": "समस्या विवरण",
    "issueDetail.noDescription": "कोई विवरण उपलब्ध नहीं है।",
    "issueDetail.media": "मीडिया",
    "issueDetail.openImage": "छवि खोलें",
    "issueDetail.noImage": "कोई छवि नहीं जुड़ी है।",
    "issueDetail.assignment": "असाइनमेंट",
    "issueDetail.address": "पता",
    "issueDetail.timestamps": "समय विवरण",
    "issueDetail.created": "बनाया गया",
    "issueDetail.updated": "अपडेट किया गया",
    "issueDetail.alreadyResolved": "यह समस्या पहले ही समाधान हो चुकी है।",
    "issueDetail.markAs": "स्थिति बदलें: {status}",
    "issueDetail.latitude": "अक्षांश",
    "issueDetail.longitude": "देशांतर",

    "modal.closeIssueDetails": "समस्या विवरण बंद करें",
    "modal.reported": "रिपोर्ट किया गया",

    "map.yourCurrentLocation": "आपका वर्तमान स्थान",
    "mapPicker.locationPicker": "स्थान चयन",
    "map.selectedLocation": "चयनित स्थान",
    "mapPicker.hint": "एमवीपी के लिए सरल निर्देशांक इनपुट। बाद में वास्तविक मानचित्र जोड़ा जा सकता है।",

    "common.loadingMap": "मानचित्र लोड हो रहा है...",
    "common.loadingIssues": "समस्याएं लोड हो रही हैं...",
    "common.loadingIssue": "समस्या लोड हो रही है...",
    "common.description": "विवरण",
    "common.category": "श्रेणी",
    "common.location": "स्थान",
    "common.photo": "फोटो",
    "common.capture": "फोटो कैप्चर करें",
    "common.upload": "फोटो अपलोड करें",
    "common.capturePhoto": "फोटो कैप्चर करें",
    "common.captureLocation": "लोकेशन कैप्चर करें",
    "common.retake": "फिर से लें",
    "common.detectMyLocation": "मेरा स्थान पहचानें",
    "common.detecting": "पहचान रहे हैं...",
    "common.cancel": "रद्द करें",
    "common.submitReport": "रिपोर्ट भेजें",
    "common.submitting": "भेजा जा रहा है...",
    "common.updated": "अपडेट",

    "capture.fetchingGps": "जीपीएस निर्देशांक प्राप्त किए जा रहे हैं...",

    "errors.loadIssues": "समस्याएं लोड नहीं हो सकीं",
    "errors.geolocationUnsupported": "इस ब्राउज़र में जियोलोकेशन समर्थित नहीं है।",
    "errors.detectLocationFailed": "स्थान पता नहीं चल पाया। कृपया मानचित्र पर मैन्युअली चुनें।",
    "errors.locationRequired": "सबमिट करने से पहले स्थान चुनें या कैप्चर करें।",
    "errors.categoryRequired": "कृपया एक श्रेणी चुनें।",
    "errors.submitIssueFailed": "समस्या सबमिट नहीं हो सकी।",
    "errors.geolocationUnavailable": "इस ब्राउज़र में जियोलोकेशन उपलब्ध नहीं है।",
    "errors.locationReadFailed": "स्थान पढ़ा नहीं जा सका। जीपीएस अनुमति सक्षम करके फिर प्रयास करें।",

    "status.all": "सभी",
    "status.reported": "रिपोर्टेड",
    "status.inProgress": "प्रगति में",
    "status.resolved": "समाधान हुआ",

    "category.all": "सभी",
    "category.pothole": "गड्ढा",
    "category.garbage": "कचरा",
    "category.streetlight": "स्ट्रीटलाइट",
    "category.flooding": "जलभराव",
    "category.graffiti": "दीवार लेखन",
    "category.roadDamage": "सड़क क्षति",
    "category.other": "अन्य",
    "category.road": "सड़क",
    "category.water": "पानी",
    "category.electricity": "बिजली"
  },
  mr: {
    "navbar.brand": "नागरिक समस्या ट्रॅकर",
    "navbar.map": "नकाशा",
    "navbar.issues": "समस्या",
    "navbar.primary": "मुख्य नेव्हिगेशन",
    "navbar.reportIssue": "+ समस्या नोंदवा",
    "navbar.language": "भाषा",
    "navbar.languageEnglish": "इंग्रजी",
    "navbar.languageHindi": "हिंदी",
    "navbar.languageMarathi": "मराठी",

    "home.heroTracked": "शहरभर {count} समस्या नोंदल्या",
    "home.heroTitleLine1": "नागरिक समस्या नोंदवा,",
    "home.heroTitleLine2": "चांगले शहर घडवा.",
    "home.heroDescription": "खड्डा, खराब स्ट्रीटलाइट किंवा साचलेला कचरा दिसला? काही सेकंदात नोंदवा आणि तक्रारीपासून निराकरणापर्यंत स्थिती पाहा.",
    "home.reportIssue": "+ समस्या नोंदवा",
    "home.browseIssues": "समस्या पहा",
    "home.totalIssues": "एकूण समस्या",
    "home.pending": "प्रलंबित",
    "home.reported": "नोंदवलेली",
    "home.resolved": "निराकरण झालेली",
    "home.issueStatsAria": "समस्या आकडेवारी",
    "home.liveIssueMap": "लाइव्ह समस्या नकाशा",
    "home.recentIssues": "अलीकडील समस्या",
    "home.viewAll": "सर्व पहा ->",

    "issueList.title": "सर्व समस्या",
    "issueList.resultCount": "{total} पैकी {visible} समस्या",
    "issueList.filter": "फिल्टर",
    "issueList.searchPlaceholder": "समस्या शोधा...",
    "issueList.status": "स्थिती",
    "issueList.category": "श्रेणी",
    "issueList.noIssuesFound": "कोणतीही समस्या सापडली नाही",
    "issueList.adjustFilters": "शोध किंवा फिल्टर बदलून पहा.",

    "create.successTitle": "समस्या नोंदवली",
    "create.successMessage": "शहर सुधारण्यासाठी मदत केल्याबद्दल धन्यवाद. समस्या यादीकडे वळवत आहोत...",
    "create.pageTitle": "समस्या नोंदवा",
    "create.pageSubtitle": "स्पष्ट माहिती आणि स्थान देऊन शहर टीमला जलद प्रतिसाद देण्यास मदत करा.",
    "create.issueDetails": "समस्या तपशील",
    "create.issueTitle": "समस्येचे शीर्षक",
    "create.issueTitlePlaceholder": "मुख्य रस्त्यावर मोठा खड्डा",
    "create.descriptionPlaceholder": "तुम्ही काय पाहिले आणि कोणता धोका आहे ते लिहा...",
    "create.suggestedCategory": "सूचना: {category}",
    "create.photoMode": "फोटो मोड",
    "create.photoOptionsHelp": "इथे प्रतिमा ड्रॅग-ड्रॉप करा किंवा अपलोड बटण वापरा.",
    "create.selectImage": "प्रतिमा निवडा",
    "create.locationSet": "स्थान सेट: {lat}, {lng}",
    "create.resolvingLocation": "निवडलेले शहर आणत आहोत...",
    "create.locationUnavailable": "स्थान निवडले आहे, पण शहराचे नाव उपलब्ध नाही.",
    "imageUpload.placeholderTitle": "तुमची प्रतिमा इथे सोडा",
    "imageUpload.placeholderHint": "किंवा फाइल निवडण्यासाठी फोटो अपलोड करा क्लिक करा.",
    "imageUpload.ready": "प्रतिमा निवडली आहे",
    "imageUpload.noFile": "कोणतीही प्रतिमा निवडलेली नाही",
    "imageUpload.fileName": "फाइल: {name}",
    "imageUpload.reset": "प्रतिमा काढा",
    "imageUpload.invalidType": "फक्त प्रतिमा फाइल्स स्वीकारल्या जातात.",
    "imageUpload.invalidSize": "प्रतिमा {max} MB पेक्षा कमी असावी.",

    "issueDetail.missingId": "समस्या आयडी सापडला नाही.",
    "issueDetail.backToIssues": "समस्यांकडे परत जा",
    "issueDetail.details": "समस्या तपशील",
    "issueDetail.noDescription": "वर्णन उपलब्ध नाही.",
    "issueDetail.media": "मीडिया",
    "issueDetail.openImage": "प्रतिमा उघडा",
    "issueDetail.noImage": "प्रतिमा जोडलेली नाही.",
    "issueDetail.assignment": "वाटप",
    "issueDetail.address": "पत्ता",
    "issueDetail.timestamps": "वेळ तपशील",
    "issueDetail.created": "तयार केले",
    "issueDetail.updated": "अद्यतनित केले",
    "issueDetail.alreadyResolved": "ही समस्या आधीच निराकरण झाली आहे.",
    "issueDetail.markAs": "स्थिती बदला: {status}",
    "issueDetail.latitude": "अक्षांश",
    "issueDetail.longitude": "रेखांश",

    "modal.closeIssueDetails": "समस्या तपशील बंद करा",
    "modal.reported": "नोंदवले",

    "map.yourCurrentLocation": "तुमचे सध्याचे स्थान",
    "mapPicker.locationPicker": "स्थान निवड",
    "map.selectedLocation": "निवडलेले स्थान",
    "mapPicker.hint": "एमव्हीपीसाठी साधे निर्देशांक इनपुट. नंतर खरा नकाशा जोडता येईल.",

    "common.loadingMap": "नकाशा लोड होत आहे...",
    "common.loadingIssues": "समस्या लोड होत आहेत...",
    "common.loadingIssue": "समस्या लोड होत आहे...",
    "common.description": "वर्णन",
    "common.category": "श्रेणी",
    "common.location": "स्थान",
    "common.photo": "फोटो",
    "common.capture": "फोटो कॅप्चर करा",
    "common.upload": "फोटो अपलोड करा",
    "common.capturePhoto": "फोटो कॅप्चर करा",
    "common.captureLocation": "लोकेशन कॅप्चर करा",
    "common.retake": "पुन्हा घ्या",
    "common.detectMyLocation": "माझे स्थान शोधा",
    "common.detecting": "शोधत आहे...",
    "common.cancel": "रद्द करा",
    "common.submitReport": "रिपोर्ट सबमिट करा",
    "common.submitting": "सबमिट होत आहे...",
    "common.updated": "अद्यतनित",

    "capture.fetchingGps": "जीपीएस निर्देशांक घेत आहोत...",

    "errors.loadIssues": "समस्या लोड करता आल्या नाहीत",
    "errors.geolocationUnsupported": "या ब्राउझरमध्ये जिओलोकेशन समर्थित नाही.",
    "errors.detectLocationFailed": "स्थान सापडले नाही. कृपया नकाशावर स्वतः निवडा.",
    "errors.locationRequired": "सबमिट करण्यापूर्वी स्थान निवडा किंवा कॅप्चर करा.",
    "errors.categoryRequired": "कृपया एक श्रेणी निवडा.",
    "errors.submitIssueFailed": "समस्या सबमिट करता आली नाही.",
    "errors.geolocationUnavailable": "या ब्राउझरमध्ये जिओलोकेशन उपलब्ध नाही.",
    "errors.locationReadFailed": "स्थान वाचता आले नाही. जीपीएस परवानगी देऊन पुन्हा प्रयत्न करा.",

    "status.all": "सर्व",
    "status.reported": "नोंदवलेली",
    "status.inProgress": "प्रगतीत",
    "status.resolved": "निराकरण झालेली",

    "category.all": "सर्व",
    "category.pothole": "खड्डा",
    "category.garbage": "कचरा",
    "category.streetlight": "स्ट्रीटलाइट",
    "category.flooding": "पाणी साचणे",
    "category.graffiti": "भित्तीचित्र",
    "category.roadDamage": "रस्त्याचे नुकसान",
    "category.other": "इतर",
    "category.road": "रस्ता",
    "category.water": "पाणी",
    "category.electricity": "वीज"
  }
};

const interpolate = (template: string, values?: InterpolationValues): string => {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
};

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "hi" || stored === "mr") {
    return stored;
  }

  return "en";
};

interface I18nContextValue {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: InterpolationValues) => string;
  formatDateTime: (value: string, options?: Intl.DateTimeFormatOptions) => string;
  translateStatus: (status: IssueStatus | CivicIssueStatus | "All") => string;
  translateCategory: (category: IssueCategory | CivicIssueCategory | "All") => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = localeByLanguage[language];
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, values?: InterpolationValues): string => {
      const template = messages[language][key] ?? messages.en[key] ?? key;
      return interpolate(template, values);
    },
    [language]
  );

  const formatDateTime = useCallback(
    (value: string, options?: Intl.DateTimeFormatOptions): string => {
      const formatter = new Intl.DateTimeFormat(localeByLanguage[language], {
        dateStyle: "medium",
        timeStyle: "short",
        ...options
      });

      return formatter.format(new Date(value));
    },
    [language]
  );

  const translateStatus = useCallback(
    (status: IssueStatus | CivicIssueStatus | "All"): string => {
      switch (status) {
        case "All":
          return t("status.all");
        case "Reported":
        case "reported":
          return t("status.reported");
        case "In Progress":
        case "in_progress":
          return t("status.inProgress");
        case "Resolved":
        case "resolved":
          return t("status.resolved");
        default:
          return String(status);
      }
    },
    [t]
  );

  const translateCategory = useCallback(
    (category: IssueCategory | CivicIssueCategory | "All"): string => {
      switch (category) {
        case "All":
          return t("category.all");
        case "Pothole":
          return t("category.pothole");
        case "Garbage":
          return t("category.garbage");
        case "Streetlight":
          return t("category.streetlight");
        case "Flooding":
          return t("category.flooding");
        case "Graffiti":
          return t("category.graffiti");
        case "Road Damage":
          return t("category.roadDamage");
        case "Other":
          return t("category.other");
        case "road":
          return t("category.road");
        case "water":
          return t("category.water");
        case "electricity":
          return t("category.electricity");
        default:
          return String(category);
      }
    },
    [t]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      locale: localeByLanguage[language],
      setLanguage,
      t,
      formatDateTime,
      translateStatus,
      translateCategory
    }),
    [language, t, formatDateTime, translateStatus, translateCategory]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (context === null) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
