import re

with open('src/utils/translations.js', 'r') as f:
    text = f.read()

en_sidebar = """    sidebar: {
      userName: "Smart Bharat",
      userId: "Digital Citizen Portal",
      dashboard: "Dashboard",
      schemes: "Public Services",
      complaints: "Grievance Redressal",
      documents: "My Documents",
      chat: "AI Assistant",
      emergency: "Emergency Support",
      settings: "Settings",
      emergencyAlert: "🚨 EMERGENCY SOS INITIATED\\n\\nDialing 112...\\nYour live location and medical profile have been securely shared with local authorities.",
      settingsAlert: "Settings panel coming soon!\\nYou will be able to manage your profile, privacy preferences, and app notifications here."
    },
    bottomNav: {
      home: "Home",
      chat: "AI Chat",
      schemes: "Schemes",
      docs: "Docs",
      issues: "Issues"
    },
"""
hi_sidebar = """    sidebar: {
      userName: "स्मार्ट भारत",
      userId: "डिजिटल नागरिक पोर्टल",
      dashboard: "डैशबोर्ड",
      schemes: "सार्वजनिक सेवाएं",
      complaints: "शिकायत निवारण",
      documents: "मेरे दस्तावेज़",
      chat: "एआई सहायक",
      emergency: "आपातकालीन सहायता",
      settings: "सेटिंग्स",
      emergencyAlert: "🚨 आपातकालीन एसओएस प्रारंभ\\n\\n112 डायल किया जा रहा है...\\nआपकी लाइव लोकेशन और मेडिकल प्रोफाइल सुरक्षित रूप से स्थानीय अधिकारियों के साथ साझा कर दी गई है।",
      settingsAlert: "सेटिंग्स पैनल जल्द आ रहा है!\\nआप यहां अपनी प्रोफाइल, गोपनीयता प्राथमिकताएं और ऐप नोटिफिकेशन प्रबंधित कर सकेंगे।"
    },
    bottomNav: {
      home: "होम",
      chat: "एआई चैट",
      schemes: "योजनाएं",
      docs: "दस्तावेज़",
      issues: "शिकायतें"
    },
"""

text = text.replace('en: {\n    appName:', 'en: {\n' + en_sidebar + '    appName:')
text = text.replace('hi: {\n    appName:', 'hi: {\n' + hi_sidebar + '    appName:')

en_dash = """
      searchPlaceholder: "Search for services, or ask AI anything...",
      heroTitle: "Namaste. <br/> How can <span>Smart Bharat</span> help you today?",
      suggested: "Suggested:",
      sug1: "PAN Card Update",
      sug2: "Gas Subsidy",
      sug3: "DigiLocker Access",
      sug4: "Ration Card",
      askAi: "Ask AI",
      latestSchemes: "Latest Schemes",
      viewAll: "View All",
      scheme1Title: "PM Kisan Samman Nidhi",
      scheme1Desc: "Direct benefit for farmers",
      scheme2Title: "Digital India Internship",
      scheme2Desc: "Applications open for 2024",
      applications: "Applications",
      app1Title: "Passport Renewal",
      app1Status: "In Review",
      app1Note: "Est. completion: 3 days",
      app2Title: "E-Shram Update",
      app2Status: "Approved",
      app2Note: "Download your certificate",
      manageAll: "Manage All",
      activeComplaints: "Active Complaints",
      comp1Title: "Street Pipe Leakage — Ward 12",
      comp1Ticket: "Ticket: #SB-9021",
      comp1Desc: "Water supply line damaged near main gate.",
      comp1Status: "Technician Assigned",
      comp1Time: "Updated 2h ago",
      comp2Title: "Street Light Not Working",
      comp2Ticket: "Ticket: #SB-8954",
      comp2Desc: "Light pole #45 flickering since Sunday night.",
      comp2Status: "Verification Pending",
      comp2Time: "Opened 2 days ago",
      forYou: "For You",
      forYouDesc: "Based on your profile, you might be eligible:",
      rec1Title: "Voter ID Shift",
      rec1Desc: "You recently updated your address. Move your constituency.",
      rec2Title: "Solar Rooftop Subsidy",
      rec2Desc: "Available for residential buildings in your ward.",
      rec3Title: "Health ID (ABHA)",
      rec3Desc: "Link your medical records for faster hospital check-ins.",
      analyze: "Analyze My Eligibility",
"""
hi_dash = """
      searchPlaceholder: "सेवाओं के लिए खोजें, या एआई से कुछ भी पूछें...",
      heroTitle: "नमस्ते। <br/> <span>स्मार्ट भारत</span> आज आपकी कैसे मदद कर सकता है?",
      suggested: "सुझाए गए:",
      sug1: "पैन कार्ड अपडेट",
      sug2: "गैस सब्सिडी",
      sug3: "डिजीलॉकर एक्सेस",
      sug4: "राशन कार्ड",
      askAi: "एआई से पूछें",
      latestSchemes: "नवीनतम योजनाएं",
      viewAll: "सभी देखें",
      scheme1Title: "पीएम किसान सम्मान निधि",
      scheme1Desc: "किसानों के लिए सीधा लाभ",
      scheme2Title: "डिजिटल इंडिया इंटर्नशिप",
      scheme2Desc: "2024 के लिए आवेदन खुले हैं",
      applications: "आवेदन",
      app1Title: "पासपोर्ट नवीनीकरण",
      app1Status: "समीक्षा में",
      app1Note: "अनुमानित पूर्णता: 3 दिन",
      app2Title: "ई-श्रम अपडेट",
      app2Status: "स्वीकृत",
      app2Note: "अपना प्रमाणपत्र डाउनलोड करें",
      manageAll: "सभी प्रबंधित करें",
      activeComplaints: "सक्रिय शिकायतें",
      comp1Title: "सड़क पाइप रिसाव — वार्ड 12",
      comp1Ticket: "टिकट: #SB-9021",
      comp1Desc: "मुख्य गेट के पास जल आपूर्ति लाइन क्षतिग्रस्त।",
      comp1Status: "तकनीशियन नियुक्त",
      comp1Time: "2 घंटे पहले अपडेट किया गया",
      comp2Title: "स्ट्रीट लाइट काम नहीं कर रही",
      comp2Ticket: "टिकट: #SB-8954",
      comp2Desc: "रविवार रात से लाइट पोल #45 टिमटिमा रहा है।",
      comp2Status: "सत्यापन लंबित",
      comp2Time: "2 दिन पहले खोला गया",
      forYou: "आपके लिए",
      forYouDesc: "आपकी प्रोफ़ाइल के आधार पर, आप पात्र हो सकते हैं:",
      rec1Title: "वोटर आईडी शिफ्ट",
      rec1Desc: "आपने हाल ही में अपना पता अपडेट किया है। अपना निर्वाचन क्षेत्र बदलें।",
      rec2Title: "सोलर रूफटॉप सब्सिडी",
      rec2Desc: "आपके वार्ड में आवासीय भवनों के लिए उपलब्ध है।",
      rec3Title: "हेल्थ आईडी (ABHA)",
      rec3Desc: "तेज़ अस्पताल चेक-इन के लिए अपने मेडिकल रिकॉर्ड लिंक करें।",
      analyze: "मेरी पात्रता का विश्लेषण करें",
"""

en_match = re.search(r'(en: \{.*?dashboard: \{)', text, re.DOTALL)
text = text[:en_match.end()] + en_dash + text[en_match.end():]

hi_match = re.search(r'(hi: \{.*?dashboard: \{)', text, re.DOTALL)
text = text[:hi_match.end()] + hi_dash + text[hi_match.end():]

en_schemes = """
      promoTitle: "Every Service,<br/>One Platform.",
      promoSubtitle: "Simplifying Governance with BharatAI",
      promoStep1: "Tell us your situation",
      promoStep2: "Auto-Fill Documentation",
      promoStep3: "Instant Submission",
"""
hi_schemes = """
      promoTitle: "हर सेवा,<br/>एक प्लेटफॉर्म।",
      promoSubtitle: "BharatAI के साथ प्रशासन को सरल बनाना",
      promoStep1: "हमें अपनी स्थिति बताएं",
      promoStep2: "दस्तावेज़ों को स्वतः भरें",
      promoStep3: "त्वरित सबमिशन",
"""

en_schemes_match = re.search(r'(en: \{.*?schemes: \{)', text, re.DOTALL)
text = text[:en_schemes_match.end()] + en_schemes + text[en_schemes_match.end():]

hi_schemes_match = re.search(r'(hi: \{.*?schemes: \{)', text, re.DOTALL)
text = text[:hi_schemes_match.end()] + hi_schemes + text[hi_schemes_match.end():]

en_complaints = """
      localIssuesTitle: "Local Issues Summary",
"""
hi_complaints = """
      localIssuesTitle: "स्थानीय मुद्दों का सारांश",
"""

en_comp_match = re.search(r'(en: \{.*?complaints: \{)', text, re.DOTALL)
text = text[:en_comp_match.end()] + en_complaints + text[en_comp_match.end():]

hi_comp_match = re.search(r'(hi: \{.*?complaints: \{)', text, re.DOTALL)
text = text[:hi_comp_match.end()] + hi_complaints + text[hi_comp_match.end():]


with open('src/utils/translations.js', 'w') as f:
    f.write(text)

