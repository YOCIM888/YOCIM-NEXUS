const adDomains = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'google-analytics.com', 'googletagmanager.com', 'facebook.com/tr',
  'ads.yahoo.com', 'amazon-adsystem.com', 'adnxs.com',
  'adsrvr.org', 'casalemedia.com', 'criteo.com', 'criteo.net',
  'demdex.net', 'moatads.com', 'outbrain.com', 'rubiconproject.com',
  'scorecardresearch.com', 'serving-sys.com', 'sharethis.com',
  'taboola.com', 'tapad.com', 'quantserve.com', 'pubmatic.com',
  'openx.net', 'contextweb.com', 'bidswitch.net', 'adform.net',
  'agkn.com', 'adsymptotic.com', 'adroll.com', 'advertising.com',
  'btrll.com', 'chartbeat.net', 'connexity.net', 'conviva.com',
  'crwdcntrl.net', 'dl-rms.com', 'exelator.com', 'eyeota.net',
  'flickr.com/beacon', 'fls.doubleclick.net', 'geoiplookup',
  'krxd.net', 'legolas-media.com', 'lijit.com', 'mookie1.com',
  'newrellic.com', 'nr-data.net', 'optimizely.com', 'pagead2.googlesyndication.com',
  'pixel.facebook.com', 'pixel.quantserve.com', 'rlcdn.com',
  'ru4.com', 'sageanalyst.net', 'semasio.net', 'sitescout.com',
  'skimresources.com', 'smartadserver.com', 'spotxchange.com',
  'statcounter.com', 'stats.g.doubleclick.net', 'tpc.googlesyndication.com',
  'tracking.hubspot.com', 'turn.com', 'umbel.com', 'undertone.com',
  'upsight.com', 'viglink.com', 'visualwebsiteoptimizer.com',
  'yieldmo.com', 'yieldoptimizer.com', 'zdbb.net', 'zeusclicks.com',
  '2mdn.net', 'ad.doubleclick.net', 'ad.360yield.com', 'ad.adriver.ru',
  'ad.highwebmedia.com', 'ad.jamba.net', 'ad.kissanime.ru',
  'ad.tapatalk.com', 'ad.zanox.com', 'adblocker-message',
  'adform.net', 'adition.com', 'adk2.com', 'admicro.vn',
  'adnxs.com', 'adorika.com', 'adotube.com', 'adplxto.com',
  'ads.buzzfeed.com', 'ads.cnn.com', 'ads.eplxtr.com', 'ads.forbes.com',
  'ads.nytimes.com', 'ads.pinterest.com', 'ads.reddit.com',
  'ads.tiktok.com', 'ads.twitter.com', 'ads.youtube.com',
  'adserver.adtech.de', 'adserver.adtechus.com', 'adskeeper.co.uk',
  'adsterra.com', 'adstxt', 'adtelligent.com', 'adthrive.com',
  'advertising.amazon.com', 'adx.adform.net', 'adx.kissmetrics.com',
  'analytics.google.com', 'analytics.instagram.com', 'analytics.linkedin.com',
  'analytics.pinterest.com', 'analytics.reddit.com', 'analytics.tiktok.com',
  'analytics.twitter.com', 'analytics.yahoo.com', 'analytics.youtube.com',
  'app.adjust.com', 'app.appsflyer.com', 'app.branch.io',
  'bat.bing.com', 'beacon.krxd.net', 'cdn.adnxs.com',
  'cdn.ampproject.org', 'cdn.mxpnl.com', 'cdn.segment.com',
  'clarity.ms', 'cms.analytics.yahoo.com', 'connect.facebook.net',
  'cs.adxpansion.com', 'd.agkn.com', 'd5.dealspotr.com',
  'dpm.demdex.net', 'e.serverbid.com', 'eb2.3lift.com',
  'edge.quantserve.com', 'events.reddit.com', 'fonts.googleapis.com/css',
  'googleads.g.doubleclick.net', 'i.w.inmobi.com', 'ib.adnxs.com',
  'idsync.rlcdn.com', 'image6.pubmatic.com', 'imp.tradedoubler.com',
  'js.adsrvr.org', 'js.hs-analytics.net', 'js.hsadspixel.net',
  'munchkin.marketo.net', 'nbcudigitaladops.com', 'pagead2.googlesyndication.com',
  'pixel.wp.com', 'p.rfihub.com', 'r.skimresources.com',
  'rc.rlcdn.com', 's.amazon-adsystem.com', 's.thebrighttag.com',
  'sb.scorecardresearch.com', 'sd.toneden.io', 'secure.adnxs.com',
  'secure.quantserve.com', 'server.iad.liveperson.net', 'sg.an.yandex.ru',
  'ssum-sec.casalemedia.com', 'stats.g.doubleclick.net',
  'tags.tiqcdn.com', 't.co', 'tr.outbrain.com',
  'tracking.musixmatch.com', 'ups.analytics.yahoo.com',
  'v1.adzcore.com', 'wd.adcolony.com', 'widgets.outbrain.com',
  'www.facebook.com/tr', 'www.google-analytics.com', 'www.googleadservices.com',
  'www.googletagmanager.com', 'x.bidswitch.net',
]

const adPathPatterns = [
  '/ads/', '/ad/', '/adv/', '/advertising/', '/banner/', '/banners/',
  '/ad.js', '/ads.js', '/adv.js', '/advertising.js', '/banner.js',
  '/doubleclick/', '/googlesyndication/', '/googleads/',
  '/pixel.', '/beacon.', '/tracker.', '/tracking.',
  '/popunder', '/popup', '/overlay', '/interstitial',
]

let adBlockEnabled = true
let webRequestFilter = null

export function setupAdBlocker(session) {
  if (!adBlockEnabled) return

  webRequestFilter = session.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'https://*/*'] },
    (details, callback) => {
      if (!adBlockEnabled) {
        callback({})
        return
      }
      const url = details.url.toLowerCase()
      const blocked = adDomains.some(domain => url.includes(domain)) ||
        adPathPatterns.some(pattern => url.includes(pattern))
      callback(blocked ? { cancel: true } : {})
    }
  )
}

export function disableAdBlocker(session) {
  if (webRequestFilter) {
    session.webRequest.onBeforeRequest(null)
    webRequestFilter = null
  }
}

export function enableAdBlocker(session) {
  setupAdBlocker(session)
}

export function isAdBlockEnabled() {
  return adBlockEnabled
}

export function setAdBlockEnabled(enabled, session) {
  adBlockEnabled = enabled
  if (enabled) {
    enableAdBlocker(session)
  } else {
    disableAdBlocker(session)
  }
}
