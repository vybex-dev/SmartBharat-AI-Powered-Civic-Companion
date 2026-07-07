// ============================================================
// DEMO FALLBACKS
// Deterministic responses that keep the hackathon demo reliable
// when an AI provider is unavailable, rate-limited, or offline.
// ============================================================

export const DEMO_COMPLAINT = {
  en: {
    description: "The streetlight near the bus stop has been broken for two weeks and the road is unsafe at night.",
    location: "MG Road bus stop, Indore",
  },
  hi: {
    description: "बस स्टॉप के पास स्ट्रीटलाइट दो हफ्तों से खराब है और रात में सड़क असुरक्षित हो जाती है।",
    location: "एमजी रोड बस स्टॉप, इंदौर",
  },
};

export const DEMO_SCHEME_SITUATION = {
  en: "I am a small farmer with 2 acres of land. I need income support and protection if crops fail due to heavy rain.",
  hi: "मैं 2 एकड़ जमीन वाला छोटा किसान हूं। मुझे आय सहायता और भारी बारिश से फसल खराब होने पर सुरक्षा चाहिए।",
};

export const DEMO_DOCUMENT_GOAL = {
  en: "Passport",
  hi: "पासपोर्ट",
};

export function getFallbackChatReply(question, language) {
  const lowerQuestion = question.toLowerCase();

  if (language === "hi") {
    if (lowerQuestion.includes("streetlight") || question.includes("स्ट्रीटलाइट")) {
      return [
        "आप इस समस्या को बिजली/नगर निगम विभाग में शिकायत के रूप में दर्ज कर सकते हैं।",
        "समस्या का स्थान, कितने दिनों से खराब है, और कोई सुरक्षा जोखिम है तो वह साफ़ लिखें।",
        "Smart Bharat आपकी शिकायत को विभाग के अनुसार वर्गीकृत कर सकता है, एक आधिकारिक सारांश बना सकता है, और ट्रैकिंग आईडी के साथ स्थिति दिखा सकता है।",
        "अंतिम पुष्टि के लिए अपने नगर निगम या राज्य शिकायत पोर्टल पर भी विवरण जांचें।",
      ].join("\n");
    }

    return [
      "मैं इसे सरल भाषा में समझाऊंगा और आपको अगले कदम बताऊंगा।",
      "आम तौर पर आपको पात्रता, आवश्यक दस्तावेज़, आवेदन पोर्टल/कार्यालय, और अनुमानित समय जांचना चाहिए।",
      "जहां शुल्क, समयसीमा या स्थानीय नियम बदल सकते हैं, वहां आधिकारिक पोर्टल या नजदीकी सेवा केंद्र से पुष्टि करें।",
    ].join("\n");
  }

  if (lowerQuestion.includes("streetlight") || lowerQuestion.includes("light")) {
    return [
      "You can report this as an electricity or municipal streetlight complaint.",
      "Mention the exact location, how long it has been broken, and why it is unsafe at night.",
      "Smart Bharat can classify it, draft an official complaint summary, save a tracking ID, and show the status until resolution.",
      "For final submission, verify the official municipal or state grievance portal for your city.",
    ].join("\n");
  }

  return [
    "I can simplify this into a clear action plan.",
    "Start by checking eligibility, required documents, the official portal or local office, and the expected timeline.",
    "If a fee, deadline, or local rule may vary, verify it on the official portal before submitting.",
  ].join("\n");
}

export function getFallbackSchemeMatches(situationText, schemes, language) {
  const haystack = situationText.toLowerCase();
  let ids = ["pm-kisan", "pmfby", "pmjdy"];

  if (haystack.includes("student") || haystack.includes("scholar") || situationText.includes("छात्र")) {
    ids = ["national-scholarship-portal", "digilocker", "pmkvy"];
  } else if (haystack.includes("business") || haystack.includes("loan") || situationText.includes("व्यवसाय")) {
    ids = ["mudra", "pmjdy", "umang"];
  } else if (haystack.includes("health") || haystack.includes("hospital") || situationText.includes("स्वास्थ्य")) {
    ids = ["ayushman-bharat", "ayushman-vay-vandana", "umang"];
  } else if (haystack.includes("house") || haystack.includes("home") || situationText.includes("घर")) {
    ids = ["pmay", "pm-ujjwala", "pmjdy"];
  }

  return ids
    .map((id) => {
      const scheme = schemes.find((candidate) => candidate.id === id);
      if (!scheme) return null;
      return {
        ...scheme,
        reason:
          language === "hi"
            ? "यह आपकी बताई गई स्थिति से मेल खाती है और अगला सरकारी लाभ या सेवा खोजने में मदद कर सकती है।"
            : "This matches the citizen's situation and gives a clear next government service to explore.",
        isFallback: true,
      };
    })
    .filter(Boolean);
}

export function getFallbackChecklist(goalText, language) {
  const isHindi = language === "hi";
  const lowerGoal = goalText.toLowerCase();
  const passportLike = lowerGoal.includes("passport") || goalText.includes("पासपोर्ट");
  const drivingLike = lowerGoal.includes("driving") || lowerGoal.includes("licence") || goalText.includes("ड्राइविंग");

  if (passportLike) {
    return isHindi
      ? {
          documents: ["आधार कार्ड", "पते का प्रमाण", "जन्म तिथि का प्रमाण", "पासपोर्ट आकार फोटो", "पुराना पासपोर्ट, यदि नवीनीकरण है"],
          steps: ["Passport Seva पोर्टल पर पंजीकरण करें", "आवेदन फॉर्म भरें और शुल्क जमा करें", "Passport Seva Kendra में अपॉइंटमेंट बुक करें", "मूल दस्तावेज़ लेकर सत्यापन के लिए जाएं", "पुलिस सत्यापन और डिस्पैच स्थिति ट्रैक करें"],
          estimatedTime: "आम तौर पर 2-4 हफ्ते",
          isFallback: true,
        }
      : {
          documents: ["Aadhaar card", "Proof of address", "Proof of date of birth", "Passport-size photograph", "Old passport, if renewing"],
          steps: ["Register on the Passport Seva portal", "Fill the application and pay the fee", "Book a Passport Seva Kendra appointment", "Carry original documents for verification", "Track police verification and dispatch status"],
          estimatedTime: "Usually 2-4 weeks",
          isFallback: true,
        };
  }

  if (drivingLike) {
    return isHindi
      ? {
          documents: ["आयु प्रमाण", "पते का प्रमाण", "पासपोर्ट आकार फोटो", "फॉर्म 1 स्व-घोषणा", "लर्नर लाइसेंस, यदि स्थायी लाइसेंस चाहिए"],
          steps: ["Parivahan पोर्टल पर आवेदन शुरू करें", "लर्नर लाइसेंस टेस्ट/स्लॉट बुक करें", "दस्तावेज़ अपलोड करें और शुल्क भरें", "ड्राइविंग टेस्ट के लिए RTO स्लॉट लें", "अनुमोदन के बाद लाइसेंस डाउनलोड/प्राप्त करें"],
          estimatedTime: "आम तौर पर 2-6 हफ्ते",
          isFallback: true,
        }
      : {
          documents: ["Proof of age", "Proof of address", "Passport-size photograph", "Form 1 self-declaration", "Learner's licence, for permanent licence"],
          steps: ["Start the application on Parivahan", "Book learner's test or slot", "Upload documents and pay fee", "Book RTO driving test slot", "Download or receive licence after approval"],
          estimatedTime: "Usually 2-6 weeks",
          isFallback: true,
        };
  }

  return isHindi
    ? {
        documents: ["पहचान प्रमाण", "पते का प्रमाण", "पासपोर्ट आकार फोटो", "सेवा से जुड़ा सहायक प्रमाण", "मोबाइल नंबर"],
        steps: ["आधिकारिक पोर्टल या सेवा केंद्र पहचानें", "पात्रता और दस्तावेज़ जांचें", "आवेदन भरें और दस्तावेज़ अपलोड करें", "रसीद/आवेदन संख्या सेव करें", "स्थिति नियमित रूप से ट्रैक करें"],
        estimatedTime: "सेवा के अनुसार 1-4 हफ्ते",
        isFallback: true,
      }
    : {
        documents: ["Identity proof", "Address proof", "Passport-size photograph", "Service-specific supporting proof", "Mobile number"],
        steps: ["Identify the official portal or service centre", "Check eligibility and documents", "Fill the application and upload documents", "Save the receipt or application number", "Track the status regularly"],
        estimatedTime: "1-4 weeks depending on the service",
        isFallback: true,
      };
}

export function getFallbackComplaintSummary(description, location, category, language) {
  const guessedCategory = category || guessComplaintCategory(description);
  return {
    category: guessedCategory,
    summary:
      language === "hi"
        ? `${location} पर दर्ज नागरिक समस्या के समाधान हेतु संबंधित विभाग को निरीक्षण और कार्रवाई की आवश्यकता है।`
        : `Civic issue reported at ${location}; the concerned department should inspect and take corrective action.`,
    isFallback: true,
  };
}

function guessComplaintCategory(description) {
  const text = description.toLowerCase();
  if (text.includes("water") || text.includes("leak") || description.includes("पानी")) return "Water";
  if (text.includes("light") || text.includes("electric") || description.includes("बिजली") || description.includes("स्ट्रीटलाइट")) return "Electricity";
  if (text.includes("garbage") || text.includes("waste") || description.includes("कचरा")) return "Sanitation";
  if (text.includes("road") || text.includes("pothole") || description.includes("सड़क")) return "Roads";
  return "Other";
}
