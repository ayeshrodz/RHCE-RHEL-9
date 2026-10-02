(function () {
  var pref = 'system';
  try {
    pref = JSON.parse(localStorage.getItem('rhce:theme')) || 'system';
  } catch (e) {}
  var dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
