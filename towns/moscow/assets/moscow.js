(() => {
	const root = document.documentElement
	const header = document.querySelector('[data-site-header]')
	const hero = document.querySelector('[data-hero]')
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

	let scrollTicking = false
	const updateScrollState = () => {
		const scrollRange = document.documentElement.scrollHeight - window.innerHeight
		const progress = scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0
		root.style.setProperty('--scroll-progress', String(progress))
		header?.classList.toggle('is-scrolled', window.scrollY > 24)
		scrollTicking = false
	}

	window.addEventListener('scroll', () => {
		if (scrollTicking) return
		scrollTicking = true
		window.requestAnimationFrame(updateScrollState)
	}, { passive: true })
	updateScrollState()

	if (hero && window.matchMedia('(pointer: fine)').matches && !reducedMotion.matches) {
		hero.addEventListener('pointermove', (event) => {
			const bounds = hero.getBoundingClientRect()
			const x = (event.clientX - bounds.left) / bounds.width - 0.5
			const y = (event.clientY - bounds.top) / bounds.height - 0.5
			hero.style.setProperty('--hero-shift-x', `${(-x * 16).toFixed(2)}px`)
			hero.style.setProperty('--hero-shift-y', `${(-y * 10).toFixed(2)}px`)
		})

		hero.addEventListener('pointerleave', () => {
			hero.style.setProperty('--hero-shift-x', '0px')
			hero.style.setProperty('--hero-shift-y', '0px')
		})
	}

	const revealItems = [...document.querySelectorAll('[data-reveal]')]
	if ('IntersectionObserver' in window && !reducedMotion.matches) {
		const revealObserver = new IntersectionObserver((entries, observer) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue
				entry.target.classList.add('is-visible')
				observer.unobserve(entry.target)
			}
		}, { rootMargin: '0px', threshold: 0.05 })
		for (const item of revealItems) revealObserver.observe(item)
	} else {
		for (const item of revealItems) item.classList.add('is-visible')
	}

	const navLinks = new Map(
		[...document.querySelectorAll('[data-nav-link]')]
			.map((link) => [link.dataset.navLink, link]),
	)
	const observedSections = [...navLinks.keys()]
		.map((id) => document.getElementById(id))
		.filter(Boolean)

	if ('IntersectionObserver' in window) {
		const sectionObserver = new IntersectionObserver((entries) => {
			const visible = entries
				.filter((entry) => entry.isIntersecting)
				.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
			if (!visible) return
			for (const link of navLinks.values()) link.classList.remove('is-current')
			navLinks.get(visible.target.id)?.classList.add('is-current')
		}, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.35] })
		for (const section of observedSections) sectionObserver.observe(section)
	}

	const viewer = document.querySelector('[data-scene-viewer]')
	if (viewer) {
		const targets = [...viewer.querySelectorAll('[data-scene-target]')]
		const stageImage = viewer.querySelector('[data-scene-image]')
		const stageOpen = viewer.querySelector('[data-scene-open]')
		const sceneTitle = viewer.querySelector('[data-scene-title]')
		const sceneCurrent = viewer.querySelector('[data-scene-current]')
		let currentIndex = 0

		const selectScene = (index, shouldCenter = true) => {
			if (targets.length === 0 || !stageImage || !stageOpen || !sceneTitle || !sceneCurrent) return
			currentIndex = (index + targets.length) % targets.length
			const target = targets[currentIndex]
			const source = target.getAttribute('href')
			const title = target.dataset.title ?? '莫斯科实景'
			const alt = target.dataset.alt ?? title
			if (!source) return

			stageImage.src = source
			stageImage.alt = alt
			stageOpen.href = source
			stageOpen.setAttribute('aria-label', `放大查看：${title}`)
			sceneTitle.textContent = title
			sceneCurrent.textContent = String(currentIndex + 1).padStart(2, '0')

			for (const item of targets) item.removeAttribute('aria-current')
			target.setAttribute('aria-current', 'true')
			if (shouldCenter) {
				target.scrollIntoView({
					behavior: reducedMotion.matches ? 'auto' : 'smooth',
					block: 'nearest',
					inline: 'center',
				})
			}
		}

		targets.forEach((target, index) => {
			target.addEventListener('click', (event) => {
				event.preventDefault()
				selectScene(index)
			})

			target.addEventListener('keydown', (event) => {
				if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
				event.preventDefault()
				const offset = event.key === 'ArrowRight' ? 1 : -1
				const nextIndex = (index + offset + targets.length) % targets.length
				targets[nextIndex].focus()
				selectScene(nextIndex)
			})
		})

		viewer.querySelector('[data-scene-previous]')?.addEventListener('click', () => {
			selectScene(currentIndex - 1)
		})
		viewer.querySelector('[data-scene-next]')?.addEventListener('click', () => {
			selectScene(currentIndex + 1)
		})
	}

	const imageDialog = document.querySelector('[data-image-dialog]')
	const dialogImage = imageDialog?.querySelector('[data-dialog-image]')
	const dialogTitle = imageDialog?.querySelector('[data-dialog-title]')
	const sceneOpen = document.querySelector('[data-scene-open]')
	let dialogTrigger = null

	const closeDialog = () => {
		if (!imageDialog?.open) return
		imageDialog.close()
	}

	if (imageDialog && dialogImage && dialogTitle && sceneOpen && typeof imageDialog.showModal === 'function') {
		sceneOpen.addEventListener('click', (event) => {
			event.preventDefault()
			dialogTrigger = sceneOpen
			dialogImage.src = sceneOpen.getAttribute('href') ?? dialogImage.src
			dialogImage.alt = sceneOpen.querySelector('img')?.alt ?? ''
			dialogTitle.textContent = document.querySelector('[data-scene-title]')?.textContent ?? '莫斯科实景'
			imageDialog.showModal()
			document.body.classList.add('dialog-open')
		})

		imageDialog.querySelector('[data-dialog-close]')?.addEventListener('click', closeDialog)
		imageDialog.addEventListener('click', (event) => {
			if (event.target === imageDialog) closeDialog()
		})
		imageDialog.addEventListener('close', () => {
			document.body.classList.remove('dialog-open')
			dialogTrigger?.focus()
			dialogTrigger = null
		})
	}

	const copyStatus = document.querySelector('[data-copy-status]')
	let copyStatusTimer = 0

	const fallbackCopy = (text) => {
		const input = document.createElement('textarea')
		input.value = text
		input.setAttribute('readonly', '')
		input.style.position = 'fixed'
		input.style.opacity = '0'
		document.body.append(input)
		input.select()
		const copied = document.execCommand('copy')
		input.remove()
		if (!copied) throw new Error('浏览器未完成复制')
	}

	const copyText = async (text) => {
		if (window.isSecureContext && navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text)
			return
		}
		fallbackCopy(text)
	}

	const announceCopy = (message) => {
		if (!copyStatus) return
		window.clearTimeout(copyStatusTimer)
		copyStatus.textContent = message
		copyStatus.classList.add('is-visible')
		copyStatusTimer = window.setTimeout(() => {
			copyStatus.classList.remove('is-visible')
		}, 2200)
	}

	for (const button of document.querySelectorAll('[data-copy-text]')) {
		button.addEventListener('click', async () => {
			const text = button.dataset.copyText
			const state = button.querySelector('[data-copy-state]')
			const defaultLabel = button.dataset.copyLabel ?? '复制'
			if (!text) return

			try {
				await copyText(text)
				if (state) state.textContent = '已复制'
				announceCopy(`已复制：${text}`)
				window.setTimeout(() => {
					if (state) state.textContent = defaultLabel
				}, 1800)
			} catch (error) {
				if (state) state.textContent = '复制失败'
				announceCopy('未能自动复制，请手动选择号码')
				console.warn('复制文本失败', error)
			}
		})
	}
})()
