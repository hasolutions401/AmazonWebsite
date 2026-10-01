import { SITE } from '../data/site.js';
import Icon from './ui/Icon.jsx';
import Reveal from './ui/Reveal.jsx';
import SectionHeader from './ui/SectionHeader.jsx';
import './VisitSection.css';

export default function VisitSection() {
  return (
    <section className="section section--line visit" id="visit" aria-labelledby="visit-heading">
      <div className="container">
        <SectionHeader kicker="Find Us" title="Visit Our" highlight="Store" id="visit-heading" />
        <div className="visit__grid">
          <Reveal className="visit__map">
            <iframe
              src={SITE.mapEmbedUrl}
              title={`Map to ${SITE.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>

          <Reveal className="visit__info card" delay={100}>
            <h3>{SITE.name}</h3>
            <ul role="list">
              <li>
                <span className="visit__icon">
                  <Icon name="pin" />
                </span>
                <div>
                  <h4>Address</h4>
                  <p>
                    {SITE.address.street}
                    <br />
                    {SITE.address.city}, {SITE.address.region} {SITE.address.zip}
                  </p>
                </div>
              </li>
              <li>
                <span className="visit__icon">
                  <Icon name="phone" />
                </span>
                <div>
                  <h4>Phone</h4>
                  <p>
                    <a href={SITE.phoneHref}>{SITE.phone}</a>
                  </p>
                </div>
              </li>
              <li>
                <span className="visit__icon">
                  <Icon name="clock" />
                </span>
                <div>
                  <h4>Hours</h4>
                  <p>{SITE.hours.label}</p>
                </div>
              </li>
            </ul>
            <div className="visit__actions">
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--pill">
                <Icon name="directions" /> Get Directions
              </a>
              <a href={SITE.phoneHref} className="btn btn--outline btn--pill">
                <Icon name="phone" /> Call Now
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
