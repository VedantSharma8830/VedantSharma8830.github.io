/* Applies saved look before first paint (no flash). */
(function(){try{var p=JSON.parse(localStorage.getItem("vs-prefs")||"{}");var d=document.documentElement;
var t=p.theme||"dark";if(t==="auto"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}
d.setAttribute("data-theme",t);if(p.accent)d.style.setProperty("--accent",p.accent);
if(p.font)d.setAttribute("data-font",p.font);if(p.density)d.setAttribute("data-density",p.density);}catch(e){}})();
