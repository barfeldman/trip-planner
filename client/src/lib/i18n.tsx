import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'he' | 'en';

const translations = {
  // Navigation
  'nav.dashboard': { he: 'לוח בקרה', en: 'Dashboard' },
  'nav.itinerary': { he: 'מסלול טיול', en: 'Itinerary' },
  'nav.stays': { he: 'לינה', en: 'Stays' },
  'nav.activities': { he: 'פעילויות', en: 'Activities' },
  'nav.budget': { he: 'תקציב', en: 'Budget' },
  'nav.transport': { he: 'תחבורה', en: 'Transport' },
  'nav.packing': { he: 'ארוז', en: 'Packing' },
  'nav.documents': { he: 'מסמכים', en: 'Documents' },
  'nav.map': { he: 'מפה', en: 'Map' },
  'nav.notes': { he: 'הערות', en: 'Notes' },

  // App
  'app.loading': { he: '...טוען את ההרפתקה שלכם', en: 'Loading your adventure...' },
  'app.noTrips': { he: 'עדיין אין טיולים מתוכננים', en: 'No trips planned yet' },
  'app.thailandTrip': { he: 'הרפתקה בתאילנד', en: 'Thailand Adventure' },
  'app.tripPlanner': { he: 'מתכנן טיולים', en: 'Trip Planner' },

  // Trip management
  'trip.createTrip': { he: 'צור טיול חדש', en: 'Create New Trip' },
  'trip.editTrip': { he: 'ערוך טיול', en: 'Edit Trip' },
  'trip.deleteTrip': { he: 'מחק טיול', en: 'Delete Trip' },
  'trip.deleteConfirm': { he: 'למחוק את הטיול? כל המידע יימחק.', en: 'Delete this trip? All data will be lost.' },
  'trip.tripName': { he: 'שם הטיול', en: 'Trip Name' },
  'trip.tripNamePlaceholder': { he: 'למשל, חופשה ביוון 🇬🇷', en: 'e.g., Greece Vacation 🇬🇷' },
  'trip.description': { he: 'תיאור', en: 'Description' },
  'trip.descPlaceholder': { he: 'ספרו על הטיול...', en: 'Tell us about your trip...' },
  'trip.startDate': { he: 'תאריך התחלה', en: 'Start Date' },
  'trip.endDate': { he: 'תאריך סיום', en: 'End Date' },
  'trip.homeCurrency': { he: 'מטבע בית', en: 'Home Currency' },
  'trip.destCurrency': { he: 'מטבע יעד', en: 'Destination Currency' },
  'trip.exchangeRate': { he: 'שער חליפין', en: 'Exchange Rate' },
  'trip.exchangeHelp': { he: 'כמה יחידות מטבע יעד = 1 מטבע בית', en: 'How many destination currency units = 1 home currency' },
  'trip.destinations': { he: 'יעדים', en: 'Destinations' },
  'trip.addDestination': { he: 'הוסף יעד', en: 'Add Destination' },
  'trip.destName': { he: 'שם היעד', en: 'Destination Name' },
  'trip.destNamePlaceholder': { he: 'למשל, אתונה', en: 'e.g., Athens' },
  'trip.country': { he: 'מדינה', en: 'Country' },
  'trip.countryPlaceholder': { he: 'למשל, יוון', en: 'e.g., Greece' },
  'trip.createBtn': { he: 'צור טיול', en: 'Create Trip' },
  'trip.saveBtn': { he: 'שמור שינויים', en: 'Save Changes' },
  'trip.welcome': { he: '!ברוכים הבאים למתכנן הטיולים', en: 'Welcome to Trip Planner!' },
  'trip.welcomeHint': { he: 'צרו את הטיול הראשון שלכם כדי להתחיל לתכנן', en: 'Create your first trip to start planning' },
  'trip.myTrips': { he: 'הטיולים שלי', en: 'My Trips' },
  'trip.switchTrip': { he: 'החלף טיול', en: 'Switch Trip' },
  'trip.generating': { he: '...מייצר ימים', en: 'Generating days...' },

  // Dashboard
  'dash.daysToGo': { he: 'ימים נותרו', en: 'days to go' },
  'dash.today': { he: '!היום', en: 'Today!' },
  'dash.daysAgo': { he: 'ימים עברו', en: 'days ago' },
  'dash.days': { he: 'ימים', en: 'days' },
  'dash.cities': { he: 'ערים', en: 'cities' },
  'dash.activities': { he: 'פעילויות', en: 'activities' },
  'dash.budget': { he: 'תקציב', en: 'Budget' },
  'dash.of': { he: 'מתוך', en: 'of' },
  'dash.planned': { he: 'מתוכנן', en: 'planned' },
  'dash.accommodations': { he: 'לינה', en: 'Accommodations' },
  'dash.booked': { he: 'הוזמנו', en: 'booked' },
  'dash.transport': { he: 'תחבורה', en: 'Transport' },
  'dash.mustDoActivities': { he: 'חובה לעשות', en: 'Must-Do Activities' },
  'dash.tripRoute': { he: 'מסלול הטיול', en: 'Trip Route' },
  'dash.budgetBreakdown': { he: 'פירוט תקציב', en: 'Budget Breakdown' },
  'dash.noBudgetData': { he: 'אין נתוני תקציב עדיין.', en: 'No budget data yet.' },
  'dash.exchangeRate': { he: 'שער חליפין', en: 'Exchange Rate' },
  'dash.budgetIn': { he: 'תקציב ב-', en: 'Budget in ' },
  'dash.totalPlanned': { he: 'סה"כ מתוכנן', en: 'total planned' },
  'dash.emergencyNumbers': { he: 'מספרי חירום', en: 'Emergency Numbers' },
  'dash.quickRef': { he: 'עיון מהיר', en: 'Quick Reference' },
  'dash.touristPolice': { he: 'משטרת תיירים', en: 'Tourist Police' },
  'dash.ambulance': { he: 'אמבולנס', en: 'Ambulance' },
  'dash.fire': { he: 'כיבוי אש', en: 'Fire' },

  // Itinerary
  'itin.title': { he: 'מסלול טיול', en: 'Itinerary' },
  'itin.subtitle': { he: 'תוכנית ההרפתקה יום-יום', en: 'Your day-by-day adventure plan' },
  'itin.day': { he: 'יום', en: 'Day' },
  'itin.addActivity': { he: 'הוסף פעילות', en: 'Add Activity' },
  'itin.activityName': { he: 'שם פעילות', en: 'Activity Name' },
  'itin.mustDo': { he: 'חובה', en: 'must-do' },
  'itin.niceTohave': { he: 'כדאי', en: 'Nice to Have' },
  'itin.mustDoLabel': { he: 'חובה לעשות', en: 'Must Do' },
  'itin.activities': { he: 'פעילויות', en: 'activities' },

  // Accommodations
  'accom.title': { he: 'לינה', en: 'Accommodations' },
  'accom.subtitle': { he: 'איפה תישנו', en: 'Where you\'ll be staying' },
  'accom.addStay': { he: 'הוסף לינה', en: 'Add Stay' },
  'accom.hotel': { he: 'מלון', en: 'Hotel' },
  'accom.hostel': { he: 'הוסטל', en: 'Hostel' },
  'accom.airbnb': { he: 'Airbnb', en: 'Airbnb' },
  'accom.resort': { he: 'ריזורט', en: 'Resort' },
  'accom.markBooked': { he: 'סמן כהוזמן', en: 'Mark Booked' },
  'accom.booked': { he: '✓ הוזמן', en: '✓ Booked' },
  'accom.noAccom': { he: 'עדיין לא הוספתם מקומות לינה', en: 'No accommodations added yet' },
  'accom.editAccom': { he: 'ערוך לינה', en: 'Edit Accommodation' },
  'accom.addAccom': { he: 'הוסף לינה', en: 'Add Accommodation' },
  'accom.bookingLink': { he: 'קישור הזמנה', en: 'Booking link' },

  // Activities
  'act.title': { he: 'פעילויות ומקומות', en: 'Activities & Places' },
  'act.thingsToDo': { he: 'דברים לעשות', en: 'things to do' },
  'act.addActivity': { he: 'הוסף פעילות', en: 'Add Activity' },
  'act.all': { he: 'הכל', en: 'All' },
  'act.you': { he: 'אתה:', en: 'You:' },
  'act.partner': { he: 'בת זוג:', en: 'Partner:' },
  'act.editActivity': { he: 'ערוך פעילות', en: 'Edit Activity' },

  // Budget
  'budget.title': { he: 'מעקב תקציב', en: 'Budget Tracker' },
  'budget.subtitle': { he: 'עקבו אחרי ההוצאות שלכם', en: 'Track your spending across categories' },
  'budget.addExpense': { he: 'הוסף הוצאה', en: 'Add Expense' },
  'budget.totalPlanned': { he: 'סה"כ מתוכנן', en: 'Total Planned' },
  'budget.spentSoFar': { he: 'הוצאנו עד כה', en: 'Spent So Far' },
  'budget.remaining': { he: 'נותר', en: 'Remaining' },
  'budget.underBudget': { he: 'מתחת לתקציב', en: 'under budget' },
  'budget.overBudget': { he: 'מעל לתקציב', en: 'over budget' },
  'budget.byCategory': { he: 'לפי קטגוריה', en: 'By Category' },
  'budget.allExpenses': { he: 'כל ההוצאות', en: 'All Expenses' },
  'budget.editExpense': { he: 'ערוך הוצאה', en: 'Edit Expense' },
  'budget.actual': { he: 'בפועל', en: 'actual' },

  // Categories
  'cat.flights': { he: 'טיסות', en: 'Flights' },
  'cat.accommodation': { he: 'לינה', en: 'Accommodation' },
  'cat.food': { he: 'אוכל', en: 'Food' },
  'cat.transport': { he: 'תחבורה', en: 'Transport' },
  'cat.activities': { he: 'פעילויות', en: 'Activities' },
  'cat.shopping': { he: 'קניות', en: 'Shopping' },
  'cat.emergency': { he: 'חירום', en: 'Emergency' },
  'cat.sightseeing': { he: 'סיורים', en: 'Sightseeing' },
  'cat.temple': { he: 'מקדש', en: 'Temple' },
  'cat.beach': { he: 'חוף', en: 'Beach' },
  'cat.restaurant': { he: 'מסעדה', en: 'Restaurant' },
  'cat.tour': { he: 'סיור', en: 'Tour' },
  'cat.market': { he: 'שוק', en: 'Market' },
  'cat.nightlife': { he: 'חיי לילה', en: 'Nightlife' },
  'cat.nature': { he: 'טבע', en: 'Nature' },
  'cat.culture': { he: 'תרבות', en: 'Culture' },

  // Transport
  'trans.title': { he: 'טיסות ותחבורה', en: 'Flights & Transport' },
  'trans.bookings': { he: 'הזמנות', en: 'bookings' },
  'trans.addTransport': { he: 'הוסף תחבורה', en: 'Add Transport' },
  'trans.flight': { he: 'טיסה', en: 'Flight' },
  'trans.train': { he: 'רכבת', en: 'Train' },
  'trans.ferry': { he: 'מעבורת', en: 'Ferry' },
  'trans.bus': { he: 'אוטובוס', en: 'Bus' },
  'trans.taxi': { he: 'מונית', en: 'Taxi' },
  'trans.privateTransfer': { he: 'הסעה פרטית', en: 'Private Transfer' },
  'trans.notBooked': { he: 'לא הוזמן', en: 'Not Booked' },
  'trans.editTransport': { he: 'ערוך תחבורה', en: 'Edit Transport' },
  'trans.noTransport': { he: 'עדיין לא הוספתם תחבורה', en: 'No transport added yet' },

  // Packing
  'pack.title': { he: 'רשימת אריזה', en: 'Packing List' },
  'pack.itemsPacked': { he: 'פריטים נארזו', en: 'items packed' },
  'pack.addItem': { he: 'הוסף פריט', en: 'Add Item' },
  'pack.progress': { he: 'התקדמות אריזה', en: 'Packing Progress' },
  'pack.allPacked': { he: '🎉 הכל ארוז! מוכנים לצאת!', en: '🎉 All packed! Ready to go!' },
  'pack.addPackingItem': { he: 'הוסף פריט לאריזה', en: 'Add Packing Item' },
  'pack.itemName': { he: 'שם הפריט', en: 'Item Name' },
  'pack.documents': { he: 'מסמכים', en: 'Documents' },
  'pack.clothes': { he: 'בגדים', en: 'Clothes' },
  'pack.toiletries': { he: 'כלי רחצה', en: 'Toiletries' },
  'pack.electronics': { he: 'אלקטרוניקה', en: 'Electronics' },
  'pack.beach': { he: 'ציוד חוף', en: 'Beach' },
  'pack.medicine': { he: 'תרופות', en: 'Medicine' },
  'pack.misc': { he: 'שונות', en: 'Misc' },

  // Documents
  'docs.title': { he: 'כספת מסמכים', en: 'Documents Vault' },
  'docs.subtitle': { he: 'שמרו מסמכי נסיעה חשובים', en: 'Store important travel documents' },
  'docs.upload': { he: 'העלה מסמך', en: 'Upload Document' },
  'docs.passport': { he: 'דרכון', en: 'Passport' },
  'docs.visa': { he: 'ויזה', en: 'Visa' },
  'docs.insurance': { he: 'ביטוח', en: 'Insurance' },
  'docs.vaccination': { he: 'חיסונים', en: 'Vaccination' },
  'docs.bookingConf': { he: 'אישור הזמנה', en: 'Booking Confirmation' },
  'docs.other': { he: 'אחר', en: 'Other' },
  'docs.docName': { he: 'שם מסמך', en: 'Document Name' },
  'docs.fileLabel': { he: 'קובץ (PDF או תמונה, עד 20MB)', en: 'File (PDF or Image, max 20MB)' },
  'docs.noDocuments': { he: 'עדיין לא הועלו מסמכים', en: 'No documents uploaded yet' },
  'docs.noDocumentsHint': { he: 'העלו סריקות דרכון, אישורי הזמנה, מסמכי ביטוח...', en: 'Upload passport scans, booking confirmations, insurance docs, etc.' },
  'docs.uploading': { he: '...מעלה', en: 'Uploading...' },
  'docs.added': { he: 'נוסף', en: 'Added' },
  'docs.namePlaceholder': { he: 'למשל, סריקת דרכון', en: 'e.g., Passport Scan' },

  // Map
  'map.title': { he: 'תצוגת מפה', en: 'Map View' },
  'map.subtitle': { he: 'המסלול שלכם ונקודות עניין', en: 'Your route and points of interest' },
  'map.destinations': { he: 'יעדים', en: 'Destinations' },
  'map.accommodations': { he: 'לינה', en: 'Accommodations' },
  'map.activities': { he: 'פעילויות', en: 'Activities' },
  'map.route': { he: 'מסלול', en: 'Route' },
  'map.stop': { he: 'תחנה', en: 'Stop' },
  'map.mustDo': { he: 'חובה', en: 'Must-do' },
  'map.niceToHave': { he: 'כדאי', en: 'Nice to have' },
  'map.stays': { he: 'מקומות לינה', en: 'stays' },

  // Notes
  'notes.title': { he: 'הערות ורעיונות', en: 'Notes & Ideas' },
  'notes.noteCount': { he: 'הערות', en: 'notes' },
  'notes.addNote': { he: 'הוסף הערה', en: 'Add Note' },
  'notes.general': { he: 'כללי', en: 'General' },
  'notes.phrase': { he: 'ביטוי', en: 'Phrase' },
  'notes.tip': { he: 'טיפ', en: 'Tip' },
  'notes.newNote': { he: 'הערה חדשה', en: 'New Note' },
  'notes.editNote': { he: 'ערוך הערה', en: 'Edit Note' },
  'notes.createNote': { he: 'צור הערה', en: 'Create Note' },
  'notes.updateNote': { he: 'עדכן הערה', en: 'Update Note' },
  'notes.showLess': { he: 'הצג פחות', en: 'Show less' },
  'notes.showMore': { he: 'הצג עוד', en: 'Show more' },
  'notes.noNotes': { he: 'עדיין אין הערות', en: 'No notes yet' },
  'notes.noNotesHint': { he: 'הוסיפו רעיונות למסעדות, ביטויים מקומיים, טיפים...', en: 'Add restaurant ideas, local phrases, travel tips...' },

  // Form common
  'form.name': { he: 'שם', en: 'Name' },
  'form.type': { he: 'סוג', en: 'Type' },
  'form.city': { he: 'עיר', en: 'City' },
  'form.selectCity': { he: 'בחרו עיר...', en: 'Select city...' },
  'form.checkIn': { he: 'צ\'ק-אין', en: 'Check-in' },
  'form.checkOut': { he: 'צ\'ק-אאוט', en: 'Check-out' },
  'form.pricePerNight': { he: 'מחיר/לילה', en: 'Price/Night' },
  'form.totalCost': { he: 'עלות כוללת', en: 'Total Cost' },
  'form.currency': { he: 'מטבע', en: 'Currency' },
  'form.roomType': { he: 'סוג חדר', en: 'Room Type' },
  'form.bookingLink': { he: 'קישור הזמנה', en: 'Booking Link' },
  'form.confirmationCode': { he: 'קוד אישור', en: 'Confirmation Code' },
  'form.notes': { he: 'הערות', en: 'Notes' },
  'form.description': { he: 'תיאור', en: 'Description' },
  'form.category': { he: 'קטגוריה', en: 'Category' },
  'form.priority': { he: 'עדיפות', en: 'Priority' },
  'form.cost': { he: 'עלות (THB)', en: 'Cost (THB)' },
  'form.duration': { he: 'משך', en: 'Duration' },
  'form.durationPlaceholder': { he: 'למשל, שעתיים', en: 'e.g. 2 hours' },
  'form.latitude': { he: 'קו רוחב', en: 'Latitude' },
  'form.longitude': { he: 'קו אורך', en: 'Longitude' },
  'form.title': { he: 'כותרת', en: 'Title' },
  'form.content': { he: 'תוכן', en: 'Content' },
  'form.quantity': { he: 'כמות', en: 'Quantity' },
  'form.plannedAmount': { he: 'סכום מתוכנן', en: 'Planned Amount' },
  'form.actualAmount': { he: 'סכום בפועל', en: 'Actual Amount' },
  'form.from': { he: 'מ-', en: 'From' },
  'form.to': { he: 'אל', en: 'To' },
  'form.departureDate': { he: 'תאריך יציאה', en: 'Departure Date' },
  'form.departureTime': { he: 'שעת יציאה', en: 'Departure Time' },
  'form.arrivalDate': { he: 'תאריך הגעה', en: 'Arrival Date' },
  'form.arrivalTime': { he: 'שעת הגעה', en: 'Arrival Time' },
  'form.airline': { he: 'חברת תעופה / מפעיל', en: 'Airline / Operator' },
  'form.price': { he: 'מחיר', en: 'Price' },
  'form.seatInfo': { he: 'מידע מושב', en: 'Seat Info' },
  'form.estimatedCost': { he: 'עלות משוערת (THB)', en: 'Estimated Cost (THB)' },
  'form.notesPlaceholder': { he: 'הערות נוספות...', en: 'Additional notes...' },

  // Actions
  'action.saving': { he: '...שומר', en: 'Saving...' },
  'action.adding': { he: '...מוסיף', en: 'Adding...' },
  'action.update': { he: 'עדכן', en: 'Update' },
  'action.view': { he: 'צפה', en: 'View' },
  'action.confirmation': { he: 'אישור:', en: 'Confirmation:' },
  'action.night': { he: '/לילה', en: '/night' },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || 'he';
    }
    return 'he';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.dir = newLocale === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale] || entry.en || key;
    },
    [locale]
  );

  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
