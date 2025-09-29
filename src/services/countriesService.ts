export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  dialCode: string;
  flag: string; // Emoji flag
  minLength: number;
  maxLength: number;
  pattern?: RegExp;
}

export const countries: Country[] = [
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫", minLength: 8, maxLength: 9 },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱", minLength: 8, maxLength: 9 },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿", minLength: 8, maxLength: 9 },
  { name: "American Samoa", code: "AS", dialCode: "+1684", flag: "🇦🇸", minLength: 7, maxLength: 7 },
  { name: "Andorra", code: "AD", dialCode: "+376", flag: "🇦🇩", minLength: 6, maxLength: 6 },
  { name: "Angola", code: "AO", dialCode: "+244", flag: "🇦🇴", minLength: 9, maxLength: 9 },
  { name: "Anguilla", code: "AI", dialCode: "+1264", flag: "🇦🇮", minLength: 7, maxLength: 7 },
  { name: "Antarctica", code: "AQ", dialCode: "+672", flag: "🇦🇶", minLength: 6, maxLength: 6 },
  { name: "Antigua and Barbuda", code: "AG", dialCode: "+1268", flag: "🇦🇬", minLength: 7, maxLength: 7 },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷", minLength: 10, maxLength: 11 },
  { name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲", minLength: 8, maxLength: 8 },
  { name: "Aruba", code: "AW", dialCode: "+297", flag: "🇦🇼", minLength: 7, maxLength: 7 },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", minLength: 9, maxLength: 9 },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹", minLength: 10, maxLength: 12 },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿", minLength: 8, maxLength: 9 },
  { name: "Bahamas", code: "BS", dialCode: "+1242", flag: "🇧🇸", minLength: 7, maxLength: 7 },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭", minLength: 8, maxLength: 8 },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩", minLength: 10, maxLength: 10 },
  { name: "Barbados", code: "BB", dialCode: "+1246", flag: "🇧🇧", minLength: 7, maxLength: 7 },
  { name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾", minLength: 9, maxLength: 9 },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪", minLength: 9, maxLength: 9 },
  { name: "Belize", code: "BZ", dialCode: "+501", flag: "🇧🇿", minLength: 7, maxLength: 7 },
  { name: "Benin", code: "BJ", dialCode: "+229", flag: "🇧🇯", minLength: 8, maxLength: 8 },
  { name: "Bermuda", code: "BM", dialCode: "+1441", flag: "🇧🇲", minLength: 7, maxLength: 7 },
  { name: "Bhutan", code: "BT", dialCode: "+975", flag: "🇧🇹", minLength: 8, maxLength: 8 },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴", minLength: 8, maxLength: 8 },
  { name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387", flag: "🇧🇦", minLength: 8, maxLength: 9 },
  { name: "Botswana", code: "BW", dialCode: "+267", flag: "🇧🇼", minLength: 7, maxLength: 8 },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", minLength: 10, maxLength: 11 },
  { name: "British Indian Ocean Territory", code: "IO", dialCode: "+246", flag: "🇮🇴", minLength: 7, maxLength: 7 },
  { name: "British Virgin Islands", code: "VG", dialCode: "+1284", flag: "🇻🇬", minLength: 7, maxLength: 7 },
  { name: "Brunei", code: "BN", dialCode: "+673", flag: "🇧🇳", minLength: 7, maxLength: 7 },
  { name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬", minLength: 8, maxLength: 9 },
  { name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "🇧🇫", minLength: 8, maxLength: 8 },
  { name: "Burundi", code: "BI", dialCode: "+257", flag: "🇧🇮", minLength: 8, maxLength: 8 },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭", minLength: 8, maxLength: 9 },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲", minLength: 8, maxLength: 9 },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", minLength: 10, maxLength: 10 },
  { name: "Cape Verde", code: "CV", dialCode: "+238", flag: "🇨🇻", minLength: 7, maxLength: 7 },
  { name: "Cayman Islands", code: "KY", dialCode: "+1345", flag: "🇰🇾", minLength: 7, maxLength: 7 },
  { name: "Central African Republic", code: "CF", dialCode: "+236", flag: "🇨🇫", minLength: 8, maxLength: 8 },
  { name: "Chad", code: "TD", dialCode: "+235", flag: "🇹🇩", minLength: 8, maxLength: 8 },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱", minLength: 9, maxLength: 9 },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", minLength: 11, maxLength: 11 },
  { name: "Christmas Island", code: "CX", dialCode: "+61", flag: "🇨🇽", minLength: 9, maxLength: 9 },
  { name: "Cocos Islands", code: "CC", dialCode: "+61", flag: "🇨🇨", minLength: 9, maxLength: 9 },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴", minLength: 10, maxLength: 10 },
  { name: "Comoros", code: "KM", dialCode: "+269", flag: "🇰🇲", minLength: 7, maxLength: 7 },
  { name: "Cook Islands", code: "CK", dialCode: "+682", flag: "🇨🇰", minLength: 5, maxLength: 5 },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷", minLength: 8, maxLength: 8 },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷", minLength: 8, maxLength: 9 },
  { name: "Cuba", code: "CU", dialCode: "+53", flag: "🇨🇺", minLength: 8, maxLength: 8 },
  { name: "Curacao", code: "CW", dialCode: "+599", flag: "🇨🇼", minLength: 7, maxLength: 8 },
  { name: "Cyprus", code: "CY", dialCode: "+357", flag: "🇨🇾", minLength: 8, maxLength: 8 },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿", minLength: 9, maxLength: 9 },
  { name: "Democratic Republic of the Congo", code: "CD", dialCode: "+243", flag: "🇨🇩", minLength: 9, maxLength: 9 },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰", minLength: 8, maxLength: 8 },
  { name: "Djibouti", code: "DJ", dialCode: "+253", flag: "🇩🇯", minLength: 8, maxLength: 8 },
  { name: "Dominica", code: "DM", dialCode: "+1767", flag: "🇩🇲", minLength: 7, maxLength: 7 },
  { name: "Dominican Republic", code: "DO", dialCode: "+1", flag: "🇩🇴", minLength: 10, maxLength: 10 },
  { name: "East Timor", code: "TL", dialCode: "+670", flag: "🇹🇱", minLength: 7, maxLength: 8 },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨", minLength: 8, maxLength: 9 },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬", minLength: 10, maxLength: 11 },
  { name: "El Salvador", code: "SV", dialCode: "+503", flag: "🇸🇻", minLength: 8, maxLength: 8 },
  { name: "Equatorial Guinea", code: "GQ", dialCode: "+240", flag: "🇬🇶", minLength: 9, maxLength: 9 },
  { name: "Eritrea", code: "ER", dialCode: "+291", flag: "🇪🇷", minLength: 7, maxLength: 7 },
  { name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪", minLength: 7, maxLength: 8 },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹", minLength: 9, maxLength: 9 },
  { name: "Falkland Islands", code: "FK", dialCode: "+500", flag: "🇫🇰", minLength: 5, maxLength: 5 },
  { name: "Faroe Islands", code: "FO", dialCode: "+298", flag: "🇫🇴", minLength: 6, maxLength: 6 },
  { name: "Fiji", code: "FJ", dialCode: "+679", flag: "🇫🇯", minLength: 7, maxLength: 7 },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮", minLength: 9, maxLength: 10 },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", minLength: 9, maxLength: 9 },
  { name: "French Guiana", code: "GF", dialCode: "+594", flag: "🇬🇫", minLength: 9, maxLength: 9 },
  { name: "French Polynesia", code: "PF", dialCode: "+689", flag: "🇵🇫", minLength: 6, maxLength: 8 },
  { name: "Gabon", code: "GA", dialCode: "+241", flag: "🇬🇦", minLength: 7, maxLength: 8 },
  { name: "Gambia", code: "GM", dialCode: "+220", flag: "🇬🇲", minLength: 7, maxLength: 7 },
  { name: "Georgia", code: "GE", dialCode: "+995", flag: "🇬🇪", minLength: 9, maxLength: 9 },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", minLength: 10, maxLength: 12 },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭", minLength: 9, maxLength: 9 },
  { name: "Gibraltar", code: "GI", dialCode: "+350", flag: "🇬🇮", minLength: 8, maxLength: 8 },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷", minLength: 10, maxLength: 10 },
  { name: "Greenland", code: "GL", dialCode: "+299", flag: "🇬🇱", minLength: 6, maxLength: 6 },
  { name: "Grenada", code: "GD", dialCode: "+1473", flag: "🇬🇩", minLength: 7, maxLength: 7 },
  { name: "Guadeloupe", code: "GP", dialCode: "+590", flag: "🇬🇵", minLength: 9, maxLength: 9 },
  { name: "Guam", code: "GU", dialCode: "+1671", flag: "🇬🇺", minLength: 7, maxLength: 7 },
  { name: "Guatemala", code: "GT", dialCode: "+502", flag: "🇬🇹", minLength: 8, maxLength: 8 },
  { name: "Guernsey", code: "GG", dialCode: "+44", flag: "🇬🇬", minLength: 10, maxLength: 10 },
  { name: "Guinea", code: "GN", dialCode: "+224", flag: "🇬🇳", minLength: 8, maxLength: 9 },
  { name: "Guinea-Bissau", code: "GW", dialCode: "+245", flag: "🇬🇼", minLength: 7, maxLength: 7 },
  { name: "Guyana", code: "GY", dialCode: "+592", flag: "🇬🇾", minLength: 7, maxLength: 7 },
  { name: "Haiti", code: "HT", dialCode: "+509", flag: "🇭🇹", minLength: 8, maxLength: 8 },
  { name: "Honduras", code: "HN", dialCode: "+504", flag: "🇭🇳", minLength: 8, maxLength: 8 },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰", minLength: 8, maxLength: 8 },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺", minLength: 8, maxLength: 9 },
  { name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸", minLength: 7, maxLength: 7 },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", minLength: 10, maxLength: 10 },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩", minLength: 9, maxLength: 12 },
  { name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷", minLength: 10, maxLength: 10 },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶", minLength: 10, maxLength: 10 },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪", minLength: 9, maxLength: 9 },
  { name: "Isle of Man", code: "IM", dialCode: "+44", flag: "🇮🇲", minLength: 10, maxLength: 10 },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱", minLength: 8, maxLength: 9 },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", minLength: 9, maxLength: 11 },
  { name: "Ivory Coast", code: "CI", dialCode: "+225", flag: "🇨🇮", minLength: 8, maxLength: 10 },
  { name: "Jamaica", code: "JM", dialCode: "+1876", flag: "🇯🇲", minLength: 7, maxLength: 7 },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", minLength: 10, maxLength: 11 },
  { name: "Jersey", code: "JE", dialCode: "+44", flag: "🇯🇪", minLength: 10, maxLength: 10 },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴", minLength: 8, maxLength: 9 },
  { name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿", minLength: 10, maxLength: 10 },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪", minLength: 9, maxLength: 9 },
  { name: "Kiribati", code: "KI", dialCode: "+686", flag: "🇰🇮", minLength: 5, maxLength: 5 },
  { name: "Kosovo", code: "XK", dialCode: "+383", flag: "🇽🇰", minLength: 8, maxLength: 9 },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼", minLength: 7, maxLength: 8 },
  { name: "Kyrgyzstan", code: "KG", dialCode: "+996", flag: "🇰🇬", minLength: 9, maxLength: 9 },
  { name: "Laos", code: "LA", dialCode: "+856", flag: "🇱🇦", minLength: 8, maxLength: 10 },
  { name: "Latvia", code: "LV", dialCode: "+371", flag: "🇱🇻", minLength: 8, maxLength: 8 },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧", minLength: 7, maxLength: 8 },
  { name: "Lesotho", code: "LS", dialCode: "+266", flag: "🇱🇸", minLength: 8, maxLength: 8 },
  { name: "Liberia", code: "LR", dialCode: "+231", flag: "🇱🇷", minLength: 7, maxLength: 8 },
  { name: "Libya", code: "LY", dialCode: "+218", flag: "🇱🇾", minLength: 9, maxLength: 9 },
  { name: "Liechtenstein", code: "LI", dialCode: "+423", flag: "🇱🇮", minLength: 7, maxLength: 7 },
  { name: "Lithuania", code: "LT", dialCode: "+370", flag: "🇱🇹", minLength: 8, maxLength: 8 },
  { name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺", minLength: 9, maxLength: 9 },
  { name: "Macau", code: "MO", dialCode: "+853", flag: "🇲🇴", minLength: 8, maxLength: 8 },
  { name: "Macedonia", code: "MK", dialCode: "+389", flag: "🇲🇰", minLength: 8, maxLength: 8 },
  { name: "Madagascar", code: "MG", dialCode: "+261", flag: "🇲🇬", minLength: 9, maxLength: 10 },
  { name: "Malawi", code: "MW", dialCode: "+265", flag: "🇲🇼", minLength: 7, maxLength: 9 },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", minLength: 9, maxLength: 10 },
  { name: "Maldives", code: "MV", dialCode: "+960", flag: "🇲🇻", minLength: 7, maxLength: 7 },
  { name: "Mali", code: "ML", dialCode: "+223", flag: "🇲🇱", minLength: 8, maxLength: 8 },
  { name: "Malta", code: "MT", dialCode: "+356", flag: "🇲🇹", minLength: 8, maxLength: 8 },
  { name: "Marshall Islands", code: "MH", dialCode: "+692", flag: "🇲🇭", minLength: 7, maxLength: 7 },
  { name: "Martinique", code: "MQ", dialCode: "+596", flag: "🇲🇶", minLength: 9, maxLength: 9 },
  { name: "Mauritania", code: "MR", dialCode: "+222", flag: "🇲🇷", minLength: 8, maxLength: 8 },
  { name: "Mauritius", code: "MU", dialCode: "+230", flag: "🇲🇺", minLength: 7, maxLength: 8 },
  { name: "Mayotte", code: "YT", dialCode: "+262", flag: "🇾🇹", minLength: 9, maxLength: 9 },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽", minLength: 10, maxLength: 10 },
  { name: "Micronesia", code: "FM", dialCode: "+691", flag: "🇫🇲", minLength: 7, maxLength: 7 },
  { name: "Moldova", code: "MD", dialCode: "+373", flag: "🇲🇩", minLength: 8, maxLength: 8 },
  { name: "Monaco", code: "MC", dialCode: "+377", flag: "🇲🇨", minLength: 8, maxLength: 9 },
  { name: "Mongolia", code: "MN", dialCode: "+976", flag: "🇲🇳", minLength: 8, maxLength: 8 },
  { name: "Montenegro", code: "ME", dialCode: "+382", flag: "🇲🇪", minLength: 8, maxLength: 9 },
  { name: "Montserrat", code: "MS", dialCode: "+1664", flag: "🇲🇸", minLength: 7, maxLength: 7 },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦", minLength: 9, maxLength: 9 },
  { name: "Mozambique", code: "MZ", dialCode: "+258", flag: "🇲🇿", minLength: 8, maxLength: 9 },
  { name: "Myanmar", code: "MM", dialCode: "+95", flag: "🇲🇲", minLength: 8, maxLength: 10 },
  { name: "Namibia", code: "NA", dialCode: "+264", flag: "🇳🇦", minLength: 7, maxLength: 8 },
  { name: "Nauru", code: "NR", dialCode: "+674", flag: "🇳🇷", minLength: 7, maxLength: 7 },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵", minLength: 10, maxLength: 10 },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱", minLength: 9, maxLength: 9 },
  { name: "New Caledonia", code: "NC", dialCode: "+687", flag: "🇳🇨", minLength: 6, maxLength: 6 },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿", minLength: 8, maxLength: 10 },
  { name: "Nicaragua", code: "NI", dialCode: "+505", flag: "🇳🇮", minLength: 8, maxLength: 8 },
  { name: "Niger", code: "NE", dialCode: "+227", flag: "🇳🇪", minLength: 8, maxLength: 8 },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬", minLength: 7, maxLength: 8 },
  { name: "Niue", code: "NU", dialCode: "+683", flag: "🇳🇺", minLength: 4, maxLength: 4 },
  { name: "Norfolk Island", code: "NF", dialCode: "+672", flag: "🇳🇫", minLength: 5, maxLength: 5 },
  { name: "North Korea", code: "KP", dialCode: "+850", flag: "🇰🇵", minLength: 8, maxLength: 10 },
  { name: "Northern Mariana Islands", code: "MP", dialCode: "+1670", flag: "🇲🇵", minLength: 7, maxLength: 7 },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴", minLength: 8, maxLength: 8 },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲", minLength: 8, maxLength: 8 },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰", minLength: 10, maxLength: 10 },
  { name: "Palau", code: "PW", dialCode: "+680", flag: "🇵🇼", minLength: 7, maxLength: 7 },
  { name: "Palestine", code: "PS", dialCode: "+970", flag: "🇵🇸", minLength: 8, maxLength: 9 },
  { name: "Panama", code: "PA", dialCode: "+507", flag: "🇵🇦", minLength: 7, maxLength: 8 },
  { name: "Papua New Guinea", code: "PG", dialCode: "+675", flag: "🇵🇬", minLength: 7, maxLength: 8 },
  { name: "Paraguay", code: "PY", dialCode: "+595", flag: "🇵🇾", minLength: 8, maxLength: 9 },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪", minLength: 8, maxLength: 9 },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭", minLength: 10, maxLength: 10 },
  { name: "Pitcairn", code: "PN", dialCode: "+64", flag: "🇵🇳", minLength: 9, maxLength: 9 },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱", minLength: 9, maxLength: 9 },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹", minLength: 9, maxLength: 9 },
  { name: "Puerto Rico", code: "PR", dialCode: "+1", flag: "🇵🇷", minLength: 10, maxLength: 10 },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦", minLength: 7, maxLength: 8 },
  { name: "Republic of the Congo", code: "CG", dialCode: "+242", flag: "🇨🇬", minLength: 9, maxLength: 9 },
  { name: "Reunion", code: "RE", dialCode: "+262", flag: "🇷🇪", minLength: 9, maxLength: 9 },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴", minLength: 9, maxLength: 9 },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺", minLength: 10, maxLength: 10 },
  { name: "Rwanda", code: "RW", dialCode: "+250", flag: "🇷🇼", minLength: 9, maxLength: 9 },
  { name: "Saint Barthelemy", code: "BL", dialCode: "+590", flag: "🇧🇱", minLength: 9, maxLength: 9 },
  { name: "Saint Helena", code: "SH", dialCode: "+290", flag: "🇸🇭", minLength: 4, maxLength: 4 },
  { name: "Saint Kitts and Nevis", code: "KN", dialCode: "+1869", flag: "🇰🇳", minLength: 7, maxLength: 7 },
  { name: "Saint Lucia", code: "LC", dialCode: "+1758", flag: "🇱🇨", minLength: 7, maxLength: 7 },
  { name: "Saint Martin", code: "MF", dialCode: "+590", flag: "🇲🇫", minLength: 9, maxLength: 9 },
  { name: "Saint Pierre and Miquelon", code: "PM", dialCode: "+508", flag: "🇵🇲", minLength: 6, maxLength: 6 },
  { name: "Saint Vincent and the Grenadines", code: "VC", dialCode: "+1784", flag: "🇻🇨", minLength: 7, maxLength: 7 },
  { name: "Samoa", code: "WS", dialCode: "+685", flag: "🇼🇸", minLength: 5, maxLength: 7 },
  { name: "San Marino", code: "SM", dialCode: "+378", flag: "🇸🇲", minLength: 6, maxLength: 10 },
  { name: "Sao Tome and Principe", code: "ST", dialCode: "+239", flag: "🇸🇹", minLength: 7, maxLength: 7 },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", minLength: 8, maxLength: 9 },
  { name: "Senegal", code: "SN", dialCode: "+221", flag: "🇸🇳", minLength: 9, maxLength: 9 },
  { name: "Serbia", code: "RS", dialCode: "+381", flag: "🇷🇸", minLength: 8, maxLength: 9 },
  { name: "Seychelles", code: "SC", dialCode: "+248", flag: "🇸🇨", minLength: 7, maxLength: 7 },
  { name: "Sierra Leone", code: "SL", dialCode: "+232", flag: "🇸🇱", minLength: 8, maxLength: 8 },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", minLength: 8, maxLength: 8 },
  { name: "Sint Maarten", code: "SX", dialCode: "+1721", flag: "🇸🇽", minLength: 7, maxLength: 7 },
  { name: "Slovakia", code: "SK", dialCode: "+421", flag: "🇸🇰", minLength: 9, maxLength: 9 },
  { name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮", minLength: 8, maxLength: 8 },
  { name: "Solomon Islands", code: "SB", dialCode: "+677", flag: "🇸🇧", minLength: 5, maxLength: 7 },
  { name: "Somalia", code: "SO", dialCode: "+252", flag: "🇸🇴", minLength: 7, maxLength: 9 },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦", minLength: 9, maxLength: 9 },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷", minLength: 9, maxLength: 11 },
  { name: "South Sudan", code: "SS", dialCode: "+211", flag: "🇸🇸", minLength: 9, maxLength: 9 },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", minLength: 9, maxLength: 9 },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰", minLength: 9, maxLength: 9 },
  { name: "Sudan", code: "SD", dialCode: "+249", flag: "🇸🇩", minLength: 9, maxLength: 9 },
  { name: "Suriname", code: "SR", dialCode: "+597", flag: "🇸🇷", minLength: 6, maxLength: 7 },
  { name: "Svalbard and Jan Mayen", code: "SJ", dialCode: "+47", flag: "🇸🇯", minLength: 8, maxLength: 8 },
  { name: "Swaziland", code: "SZ", dialCode: "+268", flag: "🇸🇿", minLength: 7, maxLength: 8 },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪", minLength: 9, maxLength: 9 },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭", minLength: 9, maxLength: 9 },
  { name: "Syria", code: "SY", dialCode: "+963", flag: "🇸🇾", minLength: 8, maxLength: 9 },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼", minLength: 8, maxLength: 9 },
  { name: "Tajikistan", code: "TJ", dialCode: "+992", flag: "🇹🇯", minLength: 9, maxLength: 9 },
  { name: "Tanzania", code: "TZ", dialCode: "+255", flag: "🇹🇿", minLength: 9, maxLength: 9 },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭", minLength: 8, maxLength: 9 },
  { name: "Togo", code: "TG", dialCode: "+228", flag: "🇹🇬", minLength: 8, maxLength: 8 },
  { name: "Tokelau", code: "TK", dialCode: "+690", flag: "🇹🇰", minLength: 4, maxLength: 4 },
  { name: "Tonga", code: "TO", dialCode: "+676", flag: "🇹🇴", minLength: 5, maxLength: 5 },
  { name: "Trinidad and Tobago", code: "TT", dialCode: "+1868", flag: "🇹🇹", minLength: 7, maxLength: 7 },
  { name: "Tunisia", code: "TN", dialCode: "+216", flag: "🇹🇳", minLength: 8, maxLength: 8 },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", minLength: 10, maxLength: 10 },
  { name: "Turkmenistan", code: "TM", dialCode: "+993", flag: "🇹🇲", minLength: 8, maxLength: 8 },
  { name: "Turks and Caicos Islands", code: "TC", dialCode: "+1649", flag: "🇹🇨", minLength: 7, maxLength: 7 },
  { name: "Tuvalu", code: "TV", dialCode: "+688", flag: "🇹🇻", minLength: 5, maxLength: 5 },
  { name: "U.S. Virgin Islands", code: "VI", dialCode: "+1340", flag: "🇻🇮", minLength: 7, maxLength: 7 },
  { name: "Uganda", code: "UG", dialCode: "+256", flag: "🇺🇬", minLength: 9, maxLength: 9 },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦", minLength: 9, maxLength: 9 },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", minLength: 8, maxLength: 9 },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", minLength: 10, maxLength: 10 },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", minLength: 10, maxLength: 10 },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾", minLength: 8, maxLength: 8 },
  { name: "Uzbekistan", code: "UZ", dialCode: "+998", flag: "🇺🇿", minLength: 9, maxLength: 9 },
  { name: "Vanuatu", code: "VU", dialCode: "+678", flag: "🇻🇺", minLength: 5, maxLength: 7 },
  { name: "Vatican", code: "VA", dialCode: "+379", flag: "🇻🇦", minLength: 6, maxLength: 10 },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪", minLength: 10, maxLength: 10 },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳", minLength: 9, maxLength: 10 },
  { name: "Wallis and Futuna", code: "WF", dialCode: "+681", flag: "🇼🇫", minLength: 6, maxLength: 6 },
  { name: "Western Sahara", code: "EH", dialCode: "+212", flag: "🇪🇭", minLength: 9, maxLength: 9 },
  { name: "Yemen", code: "YE", dialCode: "+967", flag: "🇾🇪", minLength: 7, maxLength: 9 },
  { name: "Zambia", code: "ZM", dialCode: "+260", flag: "🇿🇲", minLength: 9, maxLength: 9 },
  { name: "Zimbabwe", code: "ZW", dialCode: "+263", flag: "🇿🇼", minLength: 9, maxLength: 10 }
];

// Utility functions
export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return countries.find(country => country.dialCode === dialCode);
};

export const searchCountries = (query: string): Country[] => {
  const searchTerm = query.toLowerCase();
  return countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm) ||
    country.dialCode.includes(searchTerm)
  );
};

export const validatePhoneNumber = (phoneNumber: string, country: Country): { isValid: boolean; error: string } => {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if phone number is empty
  if (!cleanNumber) {
    return { isValid: false, error: 'Le numéro de téléphone est requis' };
  }
  
  // Check length
  if (cleanNumber.length < country.minLength) {
    return { isValid: false, error: `Le numéro doit contenir au moins ${country.minLength} chiffres` };
  }
  
  if (cleanNumber.length > country.maxLength) {
    return { isValid: false, error: `Le numéro ne peut pas dépasser ${country.maxLength} chiffres` };
  }
  
  // Check pattern if exists
  if (country.pattern && !country.pattern.test(cleanNumber)) {
    return { isValid: false, error: 'Format de numéro invalide pour ce pays' };
  }
  
  return { isValid: true, error: '' };
};

export const formatPhoneNumber = (phoneNumber: string, country: Country): string => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Basic formatting based on country
  switch (country.code) {
    case 'FR': // France: XX XX XX XX XX
      return cleanNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    case 'US': // USA: (XXX) XXX-XXXX
    case 'CA': // Canada: (XXX) XXX-XXXX
      return cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    case 'GB': // UK: XXXX XXX XXXX
      return cleanNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    case 'DE': // Germany: XXX XXXXXXX
      return cleanNumber.replace(/(\d{3})(\d{7,9})/, '$1 $2');
    case 'IT': // Italy: XXX XXX XXXX
      return cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    case 'ES': // Spain: XXX XX XX XX
      return cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    case 'JP': // Japan: XX-XXXX-XXXX
      return cleanNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    case 'CN': // China: XXX XXXX XXXX
      return cleanNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
    case 'IN': // India: XXXXX XXXXX
      return cleanNumber.replace(/(\d{5})(\d{5})/, '$1 $2');
    case 'BR': // Brazil: (XX) XXXXX-XXXX
      return cleanNumber.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    case 'AU': // Australia: XXXX XXX XXX
      return cleanNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    default:
      // Generic formatting: add spaces every 2-3 digits
      if (cleanNumber.length <= 6) {
        return cleanNumber.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3');
      } else if (cleanNumber.length <= 9) {
        return cleanNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      } else {
        return cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      }
  }
};

export const getFullPhoneNumber = (phoneNumber: string, country: Country): string => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return `${country.dialCode}${cleanNumber}`;
};

// Get default country (France)
export const getDefaultCountry = (): Country => {
  return countries.find(country => country.code === 'FR') || countries[0];
};

// Sort countries alphabetically
export const getSortedCountries = (): Country[] => {
  return [...countries].sort((a, b) => a.name.localeCompare(b.name));
};

// Get popular countries (commonly used)
export const getPopularCountries = (): Country[] => {
  const popularCodes = ['FR', 'US', 'GB', 'DE', 'ES', 'IT', 'CA', 'AU', 'JP', 'CN'];
  return popularCodes.map(code => countries.find(country => country.code === code)!).filter(Boolean);
};

// Get active countries (all countries for compatibility)
export const getActiveCountries = (): Promise<Country[]> => {
  return Promise.resolve(countries);
};