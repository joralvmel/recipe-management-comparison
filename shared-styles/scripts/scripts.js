document.addEventListener('DOMContentLoaded', () => {
	const menuIcon = document.getElementById('menu-icon');
	const mobileMenu = document.getElementById('mobile-menu');

	menuIcon.addEventListener('click', () => {
		mobileMenu.classList.toggle('open');
	});

	document.addEventListener('click', (event) => {
		if (!menuIcon.contains(event.target) && !mobileMenu.contains(event.target)) {
			mobileMenu.classList.remove('open');
		}
	});
});