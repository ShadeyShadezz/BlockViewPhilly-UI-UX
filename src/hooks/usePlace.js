import { useMapStore } from '../store/useMapStore';
import { PHILADELPHIA_TRACTS } from '../data/philadelphiaTracts';
import { PHILADELPHIA_BUILDINGS } from '../data/philadelphiaBuildings';
export function choosePlace(place,building=false){useMapStore.setState({philaSelectedGeography:null});useMapStore.setState(building?{philaSelectedBuilding:place,philaSelectedTract:null}:{philaSelectedTract:place,philaSelectedBuilding:null,activeInsight:place});}
export function usePlace(){const geography=useMapStore(s=>s.philaSelectedGeography);const tract=useMapStore(s=>s.philaSelectedTract);const building=useMapStore(s=>s.philaSelectedBuilding);const stored=useMapStore(s=>s.philaTractsWithCBS);const buildings=useMapStore(s=>s.philaBuildings);return {tract:geography??tract??(!building?PHILADELPHIA_TRACTS[0]:null),building,tracts:stored.length?stored:PHILADELPHIA_TRACTS,buildings:buildings.length?buildings:PHILADELPHIA_BUILDINGS};}
