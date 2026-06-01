// SEOHead.jsx
import useCont from "../../hooks/useCont";

export default function SEOHead(props) {
  const { company, contact } = useCont();

  const {
    priority = "default",

    title: pTitle,
    description: pDesc,
    keywords,
    author = company?.name ?? "Anka Loo Construcciones",
    canonical: pCanonical,
    robots = "index, follow",
    og = {},
    twitter = {},
    googleVerification,
    bingVerification,
    yandexVerification,
    pinterestVerification,
    geo = {
      region: "AR-X",
      placename: "Córdoba",
      position: "-31.417; -64.183",
      icbm: "-31.417, -64.183",
    },
    favicon: pFavicon,
    stylesheet,
    gtmId,
    ga4Id,
    jsonLd,
    extraMeta = [],
    extraLinks = [],
    extraScripts = [],
  } = props;

  // ---- Datos derivados
  const siteName = company?.name ?? "Anka Loo Construcciones";
  const defaultTitle = `${siteName} | Soluciones Tecnológicas Integrales`;
  const defaultDesc =
    pDesc ??
    (company
      ? `${company.name}: Soluciones de desarrollo de sistemas, software, hardware y marketing digital. Transformamos tu negocio con tecnología. ${company.address ?? ""} ${company.business_hours ? `· Horario: ${company.business_hours}` : ""}`.trim()
      : "Anka Loo Construcciones: Acompañamos a las empresas en su transformación digital con soluciones integrales de desarrollo, software, hardware y marketing digital.");

  const title = pTitle ?? defaultTitle;
  const description = pDesc ?? defaultDesc;
  const canonical = pCanonical ?? company?.domain ?? "";
  const favicon = pFavicon ?? company?.logo;

  // ---- OG / Twitter
  const ogTitle = og.title ?? title;
  const ogDesc = og.description ?? description;
  const ogImage = og.image ?? company?.logo;
  const ogUrl = og.url ?? canonical;
  const ogType = og.type ?? "website";
  const ogSite = og.siteName ?? siteName;

  const twCard = twitter.card ?? "summary_large_image";
  const twTitle = twitter.title ?? title;
  const twDesc = twitter.description ?? description;
  const twImage = twitter.image ?? ogImage;

  // ---- JSON-LD con schema para LocalBusiness o ManufacturingBusiness
  const autoJsonLd =
    !jsonLd && (company?.name || company?.address)
      ? {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: siteName,
          image: company?.logo || undefined,
          "@id": canonical || undefined,
          url: canonical || undefined,
          telephone: contact?.phone || contact?.whatsapp || undefined,
          address: company?.address
            ? {
                "@type": "PostalAddress",
                streetAddress: company.address,
                addressLocality: "Córdoba", // Ajustar si es otra ciudad
                addressRegion: "AR-X",
                addressCountry: "AR",
              }
            : undefined,
          description:
            "Soluciones tecnológicas integrales de desarrollo, software, hardware y marketing digital. Transformamos tu negocio con tecnología moderna.",
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ],
              opens: "08:00",
              closes: "18:00",
            },
          ],
        }
      : jsonLd;

  const jsonLdString = autoJsonLd ? JSON.stringify(autoJsonLd, null, 2) : null;
  const precedence =
    priority === "high" ? "high" : priority === "low" ? "low" : "default";

  return (
    <>
      {/* Title */}
      <title data-priority={precedence}>{title}</title>

      {/* Meta básicos */}
      {description && (
        <meta
          name="description"
          content={description}
          data-priority={precedence}
        />
      )}
      <meta
        name="keywords"
        content={
          keywords ||
          "desarrollo de software, transformación digital, soluciones tecnológicas, sistemas personalizados, marketing digital, desarrollo web, aplicaciones móviles, consultoría IT, Anka Loo Construcciones"
        }
        data-priority={precedence}
      />
      {author && <meta name="author" content={author} />}
      {robots && <meta name="robots" content={robots} />}

      {/* Canonical */}
      {canonical && (
        <link rel="canonical" href={canonical} precedence={precedence} />
      )}

      {/* Open Graph */}
      {ogSite && (
        <meta
          property="og:site_name"
          content={ogSite}
          data-priority={precedence}
        />
      )}
      <meta property="og:title" content={ogTitle} data-priority={precedence} />
      <meta
        property="og:description"
        content={ogDesc}
        data-priority={precedence}
      />
      {ogImage && (
        <meta
          property="og:image"
          content={ogImage}
          data-priority={precedence}
        />
      )}
      {ogUrl && (
        <meta property="og:url" content={ogUrl} data-priority={precedence} />
      )}
      <meta property="og:type" content={ogType} data-priority={precedence} />

      {/* Twitter */}
      <meta name="twitter:card" content={twCard} data-priority={precedence} />
      <meta name="twitter:title" content={twTitle} data-priority={precedence} />
      <meta
        name="twitter:description"
        content={twDesc}
        data-priority={precedence}
      />
      {twImage && (
        <meta
          name="twitter:image"
          content={twImage}
          data-priority={precedence}
        />
      )}

      {/* Verificaciones */}
      {googleVerification && (
        <meta name="google-site-verification" content={googleVerification} />
      )}
      {bingVerification && (
        <meta name="msvalidate.01" content={bingVerification} />
      )}
      {yandexVerification && (
        <meta name="yandex-verification" content={yandexVerification} />
      )}
      {pinterestVerification && (
        <meta name="p:domain_verify" content={pinterestVerification} />
      )}

      {/* Geo */}
      {geo.region && <meta name="geo.region" content={geo.region} />}
      {geo.placename && <meta name="geo.placename" content={geo.placename} />}
      {geo.position && <meta name="geo.position" content={geo.position} />}
      {geo.icbm && <meta name="ICBM" content={geo.icbm} />}

      {/* Favicon / CSS */}
      {favicon && (
        <link
          rel="icon"
          type="image/png"
          href={favicon}
          precedence={precedence}
        />
      )}
      {stylesheet && (
        <link rel="stylesheet" href={stylesheet} precedence={precedence} />
      )}

      {/* Analytics */}
      {ga4Id && !gtmId && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}');
              `,
            }}
          />
        </>
      )}

      {gtmId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      )}

      {/* JSON-LD */}
      {jsonLdString && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString }}
        />
      )}

      {/* Extras */}
      {extraMeta.map((m, i) =>
        m.name ? (
          <meta key={`xm-${i}`} name={m.name} content={m.content} />
        ) : (
          <meta key={`xm-${i}`} property={m.property} content={m.content} />
        ),
      )}
      {extraLinks.map((l, i) => (
        <link key={`xl-${i}`} {...l} />
      ))}
      {extraScripts.map((s, i) =>
        s.innerHTML ? (
          <script
            key={`xs-${i}`}
            type={s.type || "text/javascript"}
            async={s.async}
            defer={s.defer}
            dangerouslySetInnerHTML={{ __html: s.innerHTML }}
          />
        ) : (
          <script
            key={`xs-${i}`}
            src={s.src}
            async={s.async}
            defer={s.defer}
            type={s.type || "text/javascript"}
          />
        ),
      )}
    </>
  );
}
