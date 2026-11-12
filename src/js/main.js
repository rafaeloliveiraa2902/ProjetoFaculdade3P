import {initCatalog} from './features/catalog.js';
import {initMonitoring} from './features/monitoring.js';

const {navigate} = initCatalog(window.DATA);
initMonitoring(window.IMPACT, navigate);

import {initMap} from './features/map.js';
initMap(window.IMPACT);
