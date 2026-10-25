export const sitePages=['zh','en'].flatMap(lang=>[
 {path:`/${lang}/`,lang,type:'home'},
 {path:`/${lang}/pdf-to-link/`,lang,type:'pdf'},
 {path:`/${lang}/word-counter/`,lang,type:'counter'},
 {path:`/${lang}/text-dedupe/`,lang,type:'dedupe'},
 {path:`/${lang}/changelog/`,lang,type:'changelog'},
 {path:`/${lang}/contact/`,lang,type:'contact'}
]);
