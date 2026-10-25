// Tesco integration boundary.
//
// Research (Oct 2026): Tesco offers no public API for product search, basket
// or orders — the old Tesco Labs developer portal is retired. Third-party tools
// that drive a logged-in Tesco account require sharing credentials and break
// Tesco's terms, so we don't use them. What *is* supported is ordinary web
// links: search results and product pages open in the user's own logged-in
// Tesco session (browser or app), where they add items themselves.
//
// Anything planner-side talks to this interface only, so a real basket
// integration can be dropped in later by implementing `addToBasket`.

const BASE = 'https://www.tesco.com/groceries/en-GB'

export const deepLinkProvider = {
  id: 'tesco-deeplink',
  capabilities: { search: true, productLinks: true, addToBasket: false, orderStatus: false },

  searchUrl: query => `${BASE}/search?query=${encodeURIComponent(query)}`,
  productUrl: productId => `${BASE}/products/${productId}`,
  basketUrl: () => `${BASE}/trolley`,

  // Accepts a pasted Tesco product link and returns its product id.
  parseProductLink(text) {
    const m = String(text || '').match(/tesco\.com\/.*\/products\/(\d+)/)
    return m ? m[1] : null
  },

  // Best link for one shopping item: a remembered exact product if we have one,
  // otherwise a targeted search.
  linkFor(item, remembered = {}) {
    const pid = remembered[item.id]
    return pid ? this.productUrl(pid) : this.searchUrl(item.search)
  },

  async addToBasket() {
    throw new Error('Tesco does not offer basket access to third-party apps.')
  },
}

export const tesco = deepLinkProvider
