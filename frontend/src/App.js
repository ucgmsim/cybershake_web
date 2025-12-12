import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Tooltip as LeafletTooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import './App.css';

import { Box, Button, ToggleButton, ToggleButtonGroup, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';

import rules from "./config/fileRules.json";

// Set up the default icon for Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});



export function buildFilePath(type, selections) {
  const rule = rules[type];
  if (!rule) return null;

  let filename = rule.template;

  // Replace placeholders with actual selected values
  Object.entries(selections).forEach(([key, value]) => {
    filename = filename.replace(`[${key}]`, value);
  });

  // Build final path
  const pathParts = [
    "/plots",
    rule.folder,
    rule.subfolder || "",
    filename
  ];

  return pathParts.filter(Boolean).join("/");
}

export default function App() {

  const imOptionsMaps = [
    { value: "pSA_0.01", label: "pSA_0.01" },
    { value: "pSA_0.3", label: "pSA_0.3" },
    { value: "pSA_0.5", label: "pSA_0.5" },
    { value: "pSA_1.0", label: "pSA_1.0" },
    { value: "pSA_2.0", label: "pSA_2.0" },
    { value: "pSA_3.0", label: "pSA_3.0" },
    { value: "pSA_5.0", label: "pSA_5.0" },
  ];

  const imOptionsSiteHazCurve = [
    { value: "pSA_0.01", label: "pSA_0.01" },
    { value: "pSA_1.0", label: "pSA_1.0" },
    { value: "pSA_3.0", label: "pSA_3.0" },
    { value: "pSA_5.0", label: "pSA_5.0" },
  ];

  const imOptionsSiteDisagg = [
    { value: "pSA_0.01", label: "pSA_0.01" },
    { value: "pSA_0.5", label: "pSA_0.5" },
    { value: "pSA_1.0", label: "pSA_1.0" },
    { value: "pSA_2.0", label: "pSA_2.0" },
    { value: "pSA_3.0", label: "pSA_3.0" },
    { value: "pSA_5.0", label: "pSA_5.0" },
  ];


  const imOptionsSiteIM = [
    { value: "pSA_0.01", label: "pSA_0.01" },
    { value: "pSA_0.5", label: "pSA_0.5" },
    { value: "pSA_1.0", label: "pSA_1.0" },
    { value: "pSA_2.0", label: "pSA_2.0" },
    { value: "pSA_3.0", label: "pSA_3.0" },
    { value: "pSA_5.0", label: "pSA_5.0" },
  ];

  const returnPeriodOptions = [
    { value: "475", label: "10% in 50 Years" },
    { value: "2475", label: "2% in 50 Years" },
  ];

  const hazardTabs = [
    { value: 'csds', label: 'Cybershake Distributed Seismicity' },
    { value: 'fltds', label: 'Empirical Logic Tree Distributed Seismicity' },
    { value: 'cs', label: 'Cybershake' },
    { value: 'flt', label: 'Empirical Logic Tree' }
  ];
  const ratioTabs = [
    { value: 'csds-fltds', label: 'Cybershake Distributed Seismicity & Empirical Logic Tree Distributed Seismicity' },
    { value: 'cs-flt', label: 'Cybershake & Empirical Logic Tree' }
  ];

  const siteTabs = [
    { value: 'hazard_curves', label: 'Hazard Curves' },
    { value: 'uhs', label: 'UHS' },
    { value: 'disagg', label: 'Disaggregation Maps' },
    { value: 'im_comparison', label: 'IM Comparison' },
  ];

  const [im, setIm] = useState(imOptionsMaps[0].value);
  const [imSiteHazCurve, setImSiteHazCurve] = useState(imOptionsSiteHazCurve[0].value);
  const [imSiteDisagg, setImSiteDisagg] = useState(imOptionsSiteDisagg[0].value);
  const [imSiteIM, setImSiteIM] = useState(imOptionsSiteIM[0].value);
  const [returnPeriod, setReturnPeriod] = useState(returnPeriodOptions[0].value);
  const [mode, setMode] = useState('Maps');
  const [mapType, setMapType] = useState('Hazard');
  const [tab, setTab] = useState('csds');

  function imagePathMap() {
    if (!im || !returnPeriod) return null;
    const ruleType = mapType === "Hazard" ? "hazard_maps" : "ratio_maps";
    return buildFilePath(ruleType, {
      source_of_result: tab,
      im,
      return_period: returnPeriod
    });
  }

  function imagePathSite() {
    if (!siteTab || !site) return null;

    switch (siteTab) {
      case "hazard_curves":
        if (!imSiteHazCurve) return null;
        return buildFilePath("hazard_curves", {
          station_name: site,
          im: imSiteHazCurve
        });
      case "uhs":
        if (!returnPeriod || !site) return null;
        const uhsRule = uhsType === "log" ? "uhs_log" : "uhs_linear";
        return buildFilePath(uhsRule, {
          return_period: returnPeriod,
          station_name: site
        });
      case "disagg":
        if (!imSiteDisagg || !returnPeriod) return null;
        return buildFilePath("hazard_disaggregation_maps", {
          source_of_result: disaggMapType,
          station_name: site,
          im: imSiteDisagg,
          return_period: returnPeriod
        });
      case "im_comparison":
        if (!imSiteIM) return null;
        return buildFilePath("im_comparison", {
          station_name: site,
          im: imSiteIM
        });
      default:
        return null;
    }
  }

  function getImagePath() {
    return mode === "Maps" ? imagePathMap() : imagePathSite();
  }

  const tabOptions = mapType === 'Hazard' ? hazardTabs : ratioTabs;

  React.useEffect(() => {
    if (!tabOptions.some(opt => opt.value === tab)) {
      setTab(tabOptions[0].value);
    }
  }, [mapType]);

  const siteOptions = [
    {'value': '02007b5', 'label': '02007b5', 'lat': '-41.94154', 'lon': '172.56189'},
    {'value': '2200692', 'label': '2200692', 'lat': '-42.388886022', 'lon': '173.677936606'},
    {'value': '3200650', 'label': '3200650', 'lat': '-35.2274525856', 'lon': '173.951172846'},
    {'value': 'AKUS', 'label': 'AKUS', 'lat': '-36.8532', 'lon': '174.7705'},
    {'value': 'CHHC', 'label': 'CHHC', 'lat': '-43.5359', 'lon': '172.6275'},
    {'value': 'DUNS', 'label': 'DUNS', 'lat': '-45.9052', 'lon': '170.4706'},
    {'value': 'FJDS', 'label': 'FJDS', 'lat': '-43.3891', 'lon': '170.1842'},
    {'value': 'GHHS', 'label': 'GHHS', 'lat': '-38.6418', 'lon': '178.0177'},
    {'value': 'HORC', 'label': 'HORC', 'lat': '-43.5396', 'lon': '171.9599'},
    {'value': 'ICCS', 'label': 'ICCS', 'lat': '-46.4116', 'lon': '168.3469'},
    {'value': 'LHUS', 'label': 'LHUS', 'lat': '-41.2308', 'lon': '174.8936'},
    {'value': 'MGCS', 'label': 'MGCS', 'lat': '-41.5077', 'lon': '173.9444'},
    {'value': 'NCBS', 'label': 'NCBS', 'lat': '-41.2709', 'lon': '173.2837'},
    {'value': 'NPCS', 'label': 'NPCS', 'lat': '-39.0624', 'lon': '174.0734'},
    {'value': 'NSPS', 'label': 'NSPS', 'lat': '-39.4896', 'lon': '176.9159'},
    {'value': 'QTPS', 'label': 'QTPS', 'lat': '-45.0322', 'lon': '168.6629'},
    {'value': 'TBCS', 'label': 'TBCS', 'lat': '-37.7027', 'lon': '176.1567'},
    {'value': 'TPPS', 'label': 'TPPS', 'lat': '-38.6863', 'lon': '176.0675'},
    {'value': 'WKHS', 'label': 'WKHS', 'lat': '-37.9615', 'lon': '176.9855'}
  ];

  const siteOptionsDisagg = [
    {'value': '02007b5', 'label': '02007b5', 'lat': '-41.94154', 'lon': '172.56189'},
    {'value': '2200692', 'label': '2200692', 'lat': '-42.388886022', 'lon': '173.677936606'},
    {'value': 'CHHC', 'label': 'CHHC', 'lat': '-43.5359', 'lon': '172.6275'},
    {'value': 'DUNS', 'label': 'DUNS', 'lat': '-45.9052', 'lon': '170.4706'},
    {'value': 'FJDS', 'label': 'FJDS', 'lat': '-43.3891', 'lon': '170.1842'},
    {'value': 'GHHS', 'label': 'GHHS', 'lat': '-38.6418', 'lon': '178.0177'},
    {'value': 'HORC', 'label': 'HORC', 'lat': '-43.5396', 'lon': '171.9599'},
    {'value': 'ICCS', 'label': 'ICCS', 'lat': '-46.4116', 'lon': '168.3469'},
    {'value': 'LHUS', 'label': 'LHUS', 'lat': '-41.2308', 'lon': '174.8936'},
    {'value': 'MGCS', 'label': 'MGCS', 'lat': '-41.5077', 'lon': '173.9444'},
    {'value': 'NCBS', 'label': 'NCBS', 'lat': '-41.2709', 'lon': '173.2837'},
    {'value': 'NPCS', 'label': 'NPCS', 'lat': '-39.0624', 'lon': '174.0734'},
    {'value': 'NSPS', 'label': 'NSPS', 'lat': '-39.4896', 'lon': '176.9159'},
    {'value': 'QTPS', 'label': 'QTPS', 'lat': '-45.0322', 'lon': '168.6629'},
    {'value': 'TBCS', 'label': 'TBCS', 'lat': '-37.7027', 'lon': '176.1567'},
    {'value': 'TPPS', 'label': 'TPPS', 'lat': '-38.6863', 'lon': '176.0675'},
    {'value': 'WKHS', 'label': 'WKHS', 'lat': '-37.9615', 'lon': '176.9855'}
  ];


  const disaggTabs = [
    { value: 'cs', label: 'Cybershake' },
    { value: 'flt', label: 'Empirical Logic Tree' }
  ];

  const [site, setSite] = useState(siteOptions[0].value);
  const [siteTab, setSiteTab] = useState(siteTabs[0].value);
  const [uhsType, setUhsType] = useState("linear");
  const [disaggMapType , setDisaggMapType] = useState("csds");

  // Map stuff
  const nzCenter = [-41.0, 174.0];
  function RecenterMap({ site, siteOptions }) {
    const map = useMap();
    useEffect(() => {
      const selected = siteOptions.find(opt => opt.value === site);
      if (selected) {
        map.setView([Number(selected.lat), Number(selected.lon)]);
      }
    }, [site, siteOptions, map]);
    return null;
  }

  const currentSiteOptions = (mode === "Site Specific" && (siteTab === "disagg" || siteTab === "im_comparison"))
    ? siteOptionsDisagg
    : siteOptions;

  useEffect(() => {
    if (!currentSiteOptions.some(opt => opt.value === site)) {
      setSite(currentSiteOptions[0]?.value || "");
    }
  }, [siteTab, currentSiteOptions]);

  return (
    <Box display="flex" height="100vh">

      {/* Sidebar */}
      <Box width="30%" minWidth={220} p={3} bgcolor="#f5f5f5" display="flex" flexDirection="column" gap={3} height="100vh" boxSizing="border-box">
        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary"
          sx={{
            textShadow: "1px 2px 6px rgba(0,0,0,0.08)",
            letterSpacing: 1,
            mb: 2,
            borderBottom: "3px solid #1976d2",
            display: "inline-block"
          }}
        >
          Cybershake NZ 200 m Supplementary Materials
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, val) => val && setMode(val)}
        >
          <ToggleButton value="Maps">Maps</ToggleButton>
          <ToggleButton value="Site Specific">Site Specific</ToggleButton>
        </ToggleButtonGroup>
        {mode === "Maps" ? (
          <Box display="flex" flexDirection="column" gap={3}>
            <ToggleButtonGroup
              value={mapType}
              exclusive
              onChange={(e, val) => val && setMapType(val)}
            >
              <ToggleButton value="Hazard">Hazard</ToggleButton>
              <ToggleButton value="Ratio">Ratio</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              value={tab}
              exclusive
              onChange={(e, val) => val && setTab(val)}
            >
              {tabOptions.map((t) => (
                <ToggleButton key={t.value} value={t.value}>
                  {t.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <FormControl fullWidth>
              <InputLabel>IM</InputLabel>
              <Select value={im} label="IM" onChange={(e) => setIm(e.target.value)}>
                {imOptionsMaps.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Return Period</InputLabel>
              <Select value={returnPeriod} label="Return Period" onChange={(e) => setReturnPeriod(e.target.value)}>
                {returnPeriodOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3} height="100vh">
            <ToggleButtonGroup
              value={siteTab}
              exclusive
              onChange={(e, val) => val && setSiteTab(val)}
            >
              {siteTabs.map((t) => (
                <ToggleButton key={t.value} value={t.value}>
                  {t.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {siteTab === "uhs" && (
              <>
                <ToggleButtonGroup
                  value={uhsType}
                  exclusive
                  onChange={(e, val) => val && setUhsType(val)}
                >
                  <ToggleButton value="linear">Linear-Linear</ToggleButton>
                  <ToggleButton value="log">Log-Log</ToggleButton>
                </ToggleButtonGroup>
                <FormControl fullWidth>
                  <InputLabel>Return Period</InputLabel>
                  <Select value={returnPeriod} label="Return Period" onChange={e => setReturnPeriod(e.target.value)}>
                    {returnPeriodOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Site</InputLabel>
                  <Select value={site} label="Site" onChange={e => setSite(e.target.value)}>
                    {currentSiteOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {siteTab === "hazard_curves" && (
              <>
                <FormControl fullWidth>
                  <InputLabel>IM</InputLabel>
                  <Select value={imSiteHazCurve} label="IM" onChange={e => setImSiteHazCurve(e.target.value)}>
                    {imOptionsSiteHazCurve.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Site</InputLabel>
                  <Select value={site} label="Site" onChange={e => setSite(e.target.value)}>
                    {currentSiteOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {siteTab === "disagg" && (
              <>
                <ToggleButtonGroup
                  value={disaggMapType}
                  exclusive
                  onChange={(e, val) => val && setDisaggMapType(val)}
                >
                  <ToggleButton value="csds">Cybershake Distributed Seismicity</ToggleButton>
                  <ToggleButton value="fltds">Empirical Logic Tree Distributed Seismicity</ToggleButton>
                </ToggleButtonGroup>
                <FormControl fullWidth>
                  <InputLabel>IM</InputLabel>
                  <Select value={imSiteDisagg} label="IM" onChange={e => setImSiteDisagg(e.target.value)}>
                    {imOptionsSiteDisagg.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Return Period</InputLabel>
                  <Select value={returnPeriod} label="Return Period" onChange={e => setReturnPeriod(e.target.value)}>
                    {returnPeriodOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Site</InputLabel>
                  <Select value={site} label="Site" onChange={e => setSite(e.target.value)}>
                    {currentSiteOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {siteTab === "im_comparison" && (
              <>
                <FormControl fullWidth>
                  <InputLabel>IM</InputLabel>
                  <Select value={imSiteIM} label="IM" onChange={e => setImSiteIM(e.target.value)}>
                    {imOptionsSiteIM.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Site</InputLabel>
                  <Select value={site} label="Site" onChange={e => setSite(e.target.value)}>
                    {currentSiteOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                minHeight: 0,
                height: "100%",
              }}
            >
              <MapContainer
                center={nzCenter}
                zoom={7}
                scrollWheelZoom={true}
                style={{height: "100%",  width: "100%" }}
                className="map-container"
              >
                <RecenterMap site={site} siteOptions={currentSiteOptions} />
                <TileLayer
                  attribution='&copy; OpenStreetMap & CARTO'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                {currentSiteOptions.map((siteOption) => (
                  <Marker
                    key={siteOption.value}
                    position={[Number(siteOption.lat), Number(siteOption.lon)]}
                    icon={L.divIcon({
                      className: `triangle-marker${site === siteOption.value ? ' selected' : ''}`,
                      iconSize: [1, 1], // Use a visible size
                      iconAnchor: [15, 30]
                    })}
                    eventHandlers={{
                      click: () => setSite(siteOption.value),
                    }}
                  >
                    <LeafletTooltip direction="top" offset={[-3, -20]}>{siteOption.label}</LeafletTooltip>
                  </Marker>
                ))}
              </MapContainer>
            </Box>
          </Box>
        )}
      </Box>

      {/* Image */}
      <Box
        width="70%"
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        boxSizing="border-box"
      >
        <img
          src={getImagePath()}
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 64px)',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </Box>
    </Box>
  );
}
