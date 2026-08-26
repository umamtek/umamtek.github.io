// UmamTek — shared front-end behaviour
document.addEventListener('DOMContentLoaded', function () {

  /* Mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close menu when a link is tapped
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('is-open'); });
    });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(function (open) {
        open.classList.remove('is-open');
        var btn = open.querySelector('.faq-q');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Contact form -> WhatsApp handoff (no backend yet) */
  var form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('#name').value.trim();
      var phone = form.querySelector('#phone').value.trim();
      var service = form.querySelector('#service').value;
      var area = form.querySelector('#area').value.trim();
      var message = form.querySelector('#message').value.trim();

      var lines = [
        'Hi UmamTek, I would like to book a worker.',
        'Name: ' + name,
        'Phone: ' + phone,
        'Service needed: ' + service,
        'Location in Bhagalpur: ' + area
      ];
      if (message) lines.push('Details: ' + message);

      var text = encodeURIComponent(lines.join('\n'));
      var waUrl = 'https://wa.me/917544813882?text=' + text;

      var successBox = document.getElementById('form-success');
      if (successBox) successBox.classList.add('is-visible');

      window.open(waUrl, '_blank', 'noopener');
      form.reset();
    });
  }

});