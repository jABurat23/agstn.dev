import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
  Markup contract (no per-component animation code needed):

  data-reveal            block that reveals when it scrolls into view
  data-reveal="load"     same, but plays immediately on page load (hero);
                         add data-delay="1.2" to start it that many seconds later
  data-line              hairline that draws left to right
  data-vl                vertical line that draws top to bottom
  data-mask              text that rises out of a mask; wrap the text in one
                         child <span>, and give the mask element `block` or
                         `inline-block`
  data-fade              element that fades up

  A data-line outside any data-reveal block reveals on its own.
*/

const pick = (el, sel) => [...(el.matches(sel) ? [el] : []), ...el.querySelectorAll(sel)]

function reveal(el) {
  const lines = pick(el, '[data-line]')
  const vls = pick(el, '[data-vl]')
  const masks = pick(el, '[data-mask]')
  const fades = pick(el, '[data-fade]')

  masks.forEach((m) => {
    m.style.overflow = 'hidden'
    m.style.paddingBottom = '0.1em'
    m.style.marginBottom = '-0.1em'
  })

  const load = el.dataset.reveal === 'load'
  const tl = gsap.timeline(
    load
      ? { delay: 0.15 + Number(el.dataset.delay || 0) }
      : { scrollTrigger: { trigger: el, start: 'top 84%', once: true } },
  )

  if (lines.length)
    tl.from(
      lines,
      { scaleX: 0, transformOrigin: '0 50%', duration: 1.2, ease: 'expo.out', stagger: 0.1, clearProps: 'transform' },
      0,
    )
  if (vls.length)
    tl.from(
      vls,
      { scaleY: 0, transformOrigin: '50% 0', duration: 1.3, ease: 'power2.inOut', clearProps: 'transform' },
      0.2,
    )
  masks.forEach((m, i) =>
    tl.from(
      m.firstElementChild || m,
      { yPercent: 115, duration: 1.1, ease: 'expo.out', clearProps: 'transform' },
      0.1 + i * 0.08,
    ),
  )
  if (fades.length)
    tl.from(
      fades,
      { opacity: 0, y: 18, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'opacity,transform' },
      0.25,
    )
}

export default function useScrollReveals(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    // Reduced motion: nothing is registered, so everything is simply visible.
    const mm = gsap.matchMedia(root)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      root.querySelectorAll('[data-reveal]').forEach(reveal)
      root.querySelectorAll('[data-line]').forEach((l) => {
        if (!l.closest('[data-reveal]')) reveal(l)
      })
    })

    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => mm.revert()
  }, [rootRef])
}