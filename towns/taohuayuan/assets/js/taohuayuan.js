'use strict'

const currentYear = document.getElementById('current-year')
if (currentYear) currentYear.textContent = String(new Date().getFullYear())

const imageDialog = document.querySelector('.image-dialog')
const imageDialogImage = imageDialog?.querySelector('img')
const imageDialogCaption = imageDialog?.querySelector('#image-dialog-caption')
const imageDialogClose = imageDialog?.querySelector('.image-dialog-close')
let lastZoomTrigger = null

if (
  imageDialog instanceof HTMLDialogElement &&
  imageDialogImage instanceof HTMLImageElement &&
  imageDialogCaption instanceof HTMLElement &&
  typeof imageDialog.showModal === 'function'
) {
  for (const trigger of document.querySelectorAll('[data-zoom-image]')) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault()
      lastZoomTrigger = trigger
      imageDialogImage.src = trigger.dataset.zoomImage
      imageDialogImage.alt = trigger.dataset.zoomAlt ?? ''
      imageDialogCaption.textContent = trigger.dataset.zoomCaption ?? ''
      imageDialog.showModal()
    })
  }

  imageDialogClose?.addEventListener('click', () => imageDialog.close())
  imageDialog.addEventListener('click', (event) => {
    if (event.target === imageDialog) imageDialog.close()
  })
  imageDialog.addEventListener('close', () => {
    lastZoomTrigger?.focus({ preventScroll: true })
  })
}

async function writeClipboard(text) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard copy was rejected')
}

const copyGroupButton = document.querySelector('[data-copy-text]')
const copyStatus = document.querySelector('[data-copy-status]')
let copyStatusTimer = 0

copyGroupButton?.addEventListener('click', async () => {
  const text = copyGroupButton.dataset.copyText
  if (!text || !(copyStatus instanceof HTMLElement)) return

  window.clearTimeout(copyStatusTimer)
  copyGroupButton.disabled = true
  try {
    await writeClipboard(text)
    copyStatus.textContent = '群号已复制'
  } catch (error) {
    copyStatus.textContent = '复制失败，请手动选择群号'
  } finally {
    copyGroupButton.disabled = false
    copyStatusTimer = window.setTimeout(() => {
      copyStatus.textContent = ''
    }, 2400)
  }
})

const sectionLinks = [...document.querySelectorAll('[data-section-link]')]
const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')]
const sectionTargets = ['intro', 'laws']
  .map((id) => document.getElementById(id))
  .filter(Boolean)
const chapterIds = [...new Set(chapterLinks.map((link) => link.dataset.chapterLink))]
const chapterTargets = chapterIds
  .map((id) => document.getElementById(id))
  .filter(Boolean)
const currentChapterLabel = document.querySelector('[data-current-chapter]')
const chapterJump = document.querySelector('.chapter-jump')
let navigationFrame = 0

function currentTarget(targets, marker) {
  let current = null
  for (const target of targets) {
    if (target.getBoundingClientRect().top > marker) break
    current = target
  }
  return current
}

function updateCurrentLinks(links, currentId) {
  for (const link of links) {
    const targetId = link.dataset.sectionLink ?? link.dataset.chapterLink
    const isCurrent = targetId === currentId
    link.classList.toggle('is-current', isCurrent)
    if (isCurrent) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  }
}

function updateNavigation() {
  navigationFrame = 0
  const headerHeight = document.querySelector('.site-header')?.offsetHeight ?? 0
  const sectionMarker = headerHeight + 48
  const currentSection = currentTarget(sectionTargets, sectionMarker)
  updateCurrentLinks(sectionLinks, currentSection?.id ?? null)

  const jumpHeight = chapterJump?.matches(':not([hidden])') ? chapterJump.offsetHeight : 0
  const chapterMarker = headerHeight + jumpHeight + 28
  const currentChapter = currentSection?.id === 'laws'
    ? currentTarget(chapterTargets, chapterMarker)
    : null
  updateCurrentLinks(chapterLinks, currentChapter?.id ?? null)

  if (currentChapterLabel instanceof HTMLElement) {
    const currentLink = chapterLinks.find(
      (link) => link.dataset.chapterLink === currentChapter?.id,
    )
    currentChapterLabel.textContent = currentLink
      ? currentLink.textContent.replace(/\s+/g, ' ').trim()
      : '选择章节'
  }
}

function requestNavigationUpdate() {
  if (navigationFrame) return
  navigationFrame = window.requestAnimationFrame(updateNavigation)
}

for (const link of chapterJump?.querySelectorAll('a') ?? []) {
  link.addEventListener('click', () => chapterJump.removeAttribute('open'))
}

window.addEventListener('scroll', requestNavigationUpdate, { passive: true })
window.addEventListener('resize', requestNavigationUpdate)
window.addEventListener('hashchange', requestNavigationUpdate)
document.fonts?.ready.then(requestNavigationUpdate)
requestNavigationUpdate()
