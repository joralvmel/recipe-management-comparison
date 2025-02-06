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

	const selects = document.querySelectorAll('.select');
	selects.forEach(select => {
		const trigger = select.querySelector('.select-trigger');
		const options = select.querySelectorAll('.option');

		trigger.addEventListener('click', () => {
			select.classList.toggle('open');
		});

		options.forEach(option => {
			option.addEventListener('click', () => {
				options.forEach(opt => opt.classList.remove('selected'));
				option.classList.add('selected');
				trigger.querySelector('span').textContent = option.textContent;
				select.classList.remove('open');
			});
		});

		document.addEventListener('click', (event) => {
			if (!select.contains(event.target)) {
				select.classList.remove('open');
			}
		});
	});
});