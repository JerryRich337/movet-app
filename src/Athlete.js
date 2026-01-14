import React, { useState, useEffect, useRef } from "react";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, QuestionCircleOutlined, CaretUpOutlined, CaretDownOutlined, MinusOutlined } from '@ant-design/icons';
import './App.css';
import 'antd/dist/reset.css';
import { Layout, Card, Row, Col, Typography, Segmented, Tooltip, Tabs, Button } from 'antd';
import { stepCountData, heartRateData, hrsOfSleepData, physicalFuncData, painInterData, athleteFitbitGraphOptions } from "./data/graph/GraphData";
import athleteData from "./data/athleteData";
import Graph from "./atoms/graph/Graph";

const { Title } = Typography;
const { Content } = Layout;
  

const Athlete = (props) => {

    useEffect(() => {
        window.scrollTo(0, 0)
      }, [])

        const [value, setValue] = useState('Last Week');
        const [placingEvent, setPlacingEvent] = useState(false);
        const [eventsHidden, setEventsHidden] = useState(false);
        // PROMIS-specific controls for Activeness and Pain (shared)
        const [promisEventsHidden, setPromisEventsHidden] = useState(false);
        const [promisPlacingEvent, setPromisPlacingEvent] = useState(false);
        // which PROMIS chart to show: '4' = Activeness, '5' = Pain
        const [promisActiveMetric, setPromisActiveMetric] = useState('4');
        // Pain chart placement controls (unified with PROMIS Activeness)
        // Use a single PROMIS hide/details control that applies to both Activeness and Pain
        const [activeMetricKey, setActiveMetricKey] = useState('1');
        const [detailOverlayText, setDetailOverlayText] = useState(null);
        const [detailOverlayPos, setDetailOverlayPos] = useState(null);
        const [detailOverlayMeta, setDetailOverlayMeta] = useState(null); // { metricKey, labelEl }
        const [detailOverlayEditText, setDetailOverlayEditText] = useState('');
        const [detailOverlayEditing, setDetailOverlayEditing] = useState(false);
        const detailOverlayInputRef = useRef(null);
            const ignoreBlurRef = useRef(false);
        const placingEventRef = useRef(false);
        const promisPlacingEventRef = useRef(false);
        const prevBodyOverflowRef = useRef(null);
        const annotationsRef = useRef({});
        const [annotationsByMetric, setAnnotationsByMetric] = useState({
            '1': [],
            '2': [],
            '3': [],
            '4': [],
            '5': []
        });
        const previewRef = useRef(null);
        const chartRefs = useRef({});

        const closeDetailOverlay = () => {
            setDetailOverlayText(null);
            setDetailOverlayPos(null);
            setDetailOverlayEditing(false);
            setDetailOverlayEditText('');
            setDetailOverlayMeta(null);
            try {
                // restore previous body overflow to re-enable page scrolling
                if (prevBodyOverflowRef.current !== null) {
                    document.body.style.overflow = prevBodyOverflowRef.current;
                } else {
                    document.body.style.overflow = '';
                }
            } catch (e) {
                /* ignore */
            }
            prevBodyOverflowRef.current = null;
        };

        const openDetailOverlayAtLabel = (labelEl, text, meta) => {
            const trimmed = String(text || '').trim();
            if (!trimmed) return;

            let left = 16;
            let top = 16;
            let placement = 'above';

            try {
                if (labelEl && typeof labelEl.getBoundingClientRect === 'function') {
                    const rect = labelEl.getBoundingClientRect();

                    // Prefer: to the right and slightly above the clicked label.
                    const preferredLeft = rect.right + 12;
                    const preferredTopAnchor = rect.top - 8;

                    // Use a consistent placement: always to the right and vertically
                    // centered relative to the clicked label so every overlay has the
                    // same x,y relationship to its label.
                    placement = 'center';

                    const estimatedWidth = 360;
                    const viewportW = window.innerWidth || 0;
                    const viewportH = window.innerHeight || 0;

                    // Keep a uniform x-offset to the right of the label for all events.
                    // Do NOT clamp to viewport width — keep placement at rect.right + 12
                    // so events 13/14 remain aligned relative to their labels.
                    left = preferredLeft;

                    // Vertically center the overlay on the label's middle.
                    top = Math.max(16, Math.min(viewportH - 16, rect.top + (rect.height / 2)));
                }
            } catch (e) {
                // fallback to default fixed placement
            }

            setDetailOverlayPos({ left, top, placement, side: 'right' });
            // prevent background page scrolling while overlay is open
            try {
                prevBodyOverflowRef.current = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
            } catch (e) { /* ignore */ }

            setDetailOverlayText(trimmed);
            setDetailOverlayMeta(meta || null);
            setDetailOverlayEditText(trimmed);
            setDetailOverlayEditing(false);
        };

        // Keep latest placement-mode values accessible to native event listeners.
        useEffect(() => {
            placingEventRef.current = placingEvent;
        }, [placingEvent]);

        useEffect(() => {
            promisPlacingEventRef.current = promisPlacingEvent;
        }, [promisPlacingEvent]);

        useEffect(() => {
            annotationsRef.current = annotationsByMetric;
        }, [annotationsByMetric]);

        // Restore body overflow if component unmounts while overlay is open
        useEffect(() => {
            return () => {
                try {
                    if (prevBodyOverflowRef.current !== null) {
                        document.body.style.overflow = prevBodyOverflowRef.current;
                    } else {
                        document.body.style.overflow = '';
                    }
                } catch (e) { /* ignore */ }
            };
        }, []);

        // ApexCharts sometimes stops native click propagation before React's synthetic
        // handlers see it. Use a native document *capture* listener (pointerdown)
        // so interactions on the rendered annotation label (including its background
        // <rect>) still open the overlay when placement mode is OFF.
        useEffect(() => {
            const selectors = '.apexcharts-annotation-label, .apexcharts-xaxis-annotation-label, .apexcharts-point-annotation-label';

            const findAncestor = (start, predicate) => {
                let el = start;
                while (el && el !== document.documentElement) {
                    if (predicate(el)) return el;
                    el = (el.parentNode && el.parentNode.nodeType === 1) ? el.parentNode : null;
                }
                return null;
            };

            const withinRect = (rect, x, y) => {
                if (!rect) return false;
                return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
            };

            const getNearestCategoryForWrapperAtX = (wrapper, pageX) => {
                try {
                    const labels = Array.from(wrapper.querySelectorAll('.apexcharts-xaxis-texts-g text'));
                    if (!labels.length) return null;

                    let nearestIdx = -1;
                    let nearestDist = Infinity;
                    labels.forEach((l, idx) => {
                        const r = l.getBoundingClientRect();
                        const cx = r.left + r.width / 2;
                        const d = Math.abs(pageX - cx);
                        if (d < nearestDist) {
                            nearestDist = d;
                            nearestIdx = idx;
                        }
                    });

                    if (nearestIdx < 0) return null;

                    const categories = (athleteFitbitGraphOptions && athleteFitbitGraphOptions.xaxis && Array.isArray(athleteFitbitGraphOptions.xaxis.categories))
                        ? athleteFitbitGraphOptions.xaxis.categories
                        : null;

                    if (categories && categories[nearestIdx] !== undefined) return categories[nearestIdx];
                    const raw = labels[nearestIdx].textContent;
                    return raw ? String(raw).trim() : null;
                } catch (e) {
                    return null;
                }
            };

            const onDocPointerDownCapture = (ev) => {
                try {
                    const target = ev.target;
                    if (!target || target.nodeType !== 1) return;

                    const labelEl = findAncestor(target, (el) =>
                        el.matches && typeof el.matches === 'function' && el.matches(selectors)
                    );
                    let resolvedLabelEl = labelEl;

                    // Resolve chart wrapper first; if we didn't hit a label directly, we'll
                    // still attempt a hit-test against all labels in this wrapper.
                    const wrapper = findAncestor(target, (el) =>
                        el.classList && el.classList.contains('chart-wrapper')
                    );
                    if (!wrapper || !wrapper.getAttribute) return;

                    const metricKey = wrapper.getAttribute('data-metric');
                    const isPromisMetric = (String(metricKey) === '4' || String(metricKey) === '5');
                    const placementOn = isPromisMetric ? promisPlacingEventRef.current : placingEventRef.current;
                    if (placementOn) return;

                    // If the pointerdown didn't originate inside a label element (common when
                    // ApexCharts renders SVG shapes with odd event behavior), do a best-effort
                    // hit-test against the label bounding boxes.
                    if (!resolvedLabelEl) {
                        const x = ev.clientX;
                        const y = ev.clientY;
                        const candidates = Array.from(wrapper.querySelectorAll(selectors));
                        resolvedLabelEl = candidates.find(el => {
                            try {
                                const r = el.getBoundingClientRect();
                                return withinRect(r, x, y);
                            } catch (e) {
                                return false;
                            }
                        }) || null;
                    }

                    if (!resolvedLabelEl) return;

                    // Prefer looking up the full text from state (untruncated), keyed by the
                    // nearest x-axis category (annotation.x). DOM label text is truncated.
                    const category = getNearestCategoryForWrapperAtX(wrapper, ev.clientX);
                    const anns = (annotationsRef.current && annotationsRef.current[String(metricKey)])
                        ? annotationsRef.current[String(metricKey)]
                        : [];
                    const match = category
                        ? anns.find(a => a && String(a.x) === String(category))
                        : null;

                    const full = (match && match.fullText)
                        ? String(match.fullText)
                        : ((resolvedLabelEl.getAttribute && (resolvedLabelEl.getAttribute('data-fulltext') || ''))
                            || (resolvedLabelEl.textContent || ''));
                    const trimmed = String(full).trim();
                    if (!trimmed) return;

                    openDetailOverlayAtLabel(resolvedLabelEl, trimmed, { metricKey, labelEl: resolvedLabelEl });
                    ev.preventDefault();
                    ev.stopPropagation();
                } catch (e) {
                    // ignore
                }
            };

            document.addEventListener('pointerdown', onDocPointerDownCapture, true);
            return () => document.removeEventListener('pointerdown', onDocPointerDownCapture, true);
        }, []);

        useEffect(() => {
            if (!detailOverlayText) return;
            const onKeyDown = (ev) => {
                if (ev.key === 'Escape') closeDetailOverlay();
            };
            window.addEventListener('keydown', onKeyDown);
            return () => window.removeEventListener('keydown', onKeyDown);
        }, [detailOverlayText]);

        // Allow ESC to exit placement/detail toggle modes (global listener uses refs)
        useEffect(() => {
            const onKey = (ev) => {
                if (ev.key !== 'Escape') return;
                try {
                    if (placingEventRef.current) setPlacingEvent(false);
                    if (promisPlacingEventRef.current) setPromisPlacingEvent(false);
                } catch (e) { /* ignore */ }
            };
            window.addEventListener('keydown', onKey);
            return () => window.removeEventListener('keydown', onKey);
        }, []);

        // Best-effort: attach full (untruncated) detail text to rendered label nodes so
        // clicking the label can show the full value.
        useEffect(() => {
            const t = setTimeout(() => {
                try {
                    ['1', '2', '3', '4', '5'].forEach((metricKey) => {
                        const wrapper = document.querySelector(`.chart-wrapper[data-metric="${metricKey}"]`);
                        if (!wrapper) return;
                        const labelEls = Array.from(wrapper.querySelectorAll('.apexcharts-annotation-label'));
                        const anns = annotationsByMetric[metricKey] || [];

                        // Build x-axis label centers so we can map a rendered annotation label
                        // back to the nearest category (ann.x stores the category string).
                        const axisTextEls = Array.from(wrapper.querySelectorAll('.apexcharts-xaxis-texts-g text'));
                        const axisCenters = axisTextEls.map((n) => {
                            const r = n.getBoundingClientRect();
                            return { node: n, cx: r.left + r.width / 2 };
                        });

                        const categories = (athleteFitbitGraphOptions && athleteFitbitGraphOptions.xaxis && Array.isArray(athleteFitbitGraphOptions.xaxis.categories))
                            ? athleteFitbitGraphOptions.xaxis.categories
                            : null;

                        const nearestCategoryAtPageX = (pageX) => {
                            if (!axisCenters.length) return null;
                            let nearestIdx = -1;
                            let nearestDist = Infinity;
                            axisCenters.forEach((p, idx) => {
                                const d = Math.abs(pageX - p.cx);
                                if (d < nearestDist) {
                                    nearestDist = d;
                                    nearestIdx = idx;
                                }
                            });
                            if (nearestIdx < 0) return null;
                            if (categories && categories[nearestIdx] !== undefined) return categories[nearestIdx];
                            const raw = axisCenters[nearestIdx].node && axisCenters[nearestIdx].node.textContent;
                            return raw ? String(raw).trim() : null;
                        };

                        labelEls.forEach((el) => {
                            try {
                                const r = el.getBoundingClientRect();
                                const cx = r.left + r.width / 2;
                                const cat = nearestCategoryAtPageX(cx);
                                if (!cat) return;
                                const match = anns.find(a => a && String(a.x) === String(cat));
                                const full = (match && match.fullText) ? String(match.fullText) : '';
                                if (full) el.setAttribute('data-fulltext', full);
                            } catch (e) {
                                // ignore per-label
                            }
                        });
                    });
                } catch (e) {
                    // ignore
                }
            }, 0);
            return () => clearTimeout(t);
        }, [annotationsByMetric]);

        // Resolve the x-axis category nearest to a rendered label element
        const resolveCategoryFromLabelEl = (labelEl) => {
            try {
                if (!labelEl || !labelEl.getBoundingClientRect) return null;
                const wrapper = labelEl.closest && labelEl.closest('.chart-wrapper');
                if (!wrapper) return null;
                const axisTextEls = Array.from(wrapper.querySelectorAll('.apexcharts-xaxis-texts-g text'));
                if (!axisTextEls.length) return null;
                const r = labelEl.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                let nearestIdx = -1; let nearestDist = Infinity;
                axisTextEls.forEach((n, idx) => {
                    try {
                        const rr = n.getBoundingClientRect();
                        const p = rr.left + rr.width / 2;
                        const d = Math.abs(cx - p);
                        if (d < nearestDist) { nearestDist = d; nearestIdx = idx; }
                    } catch (e) { /* ignore per-label */ }
                });
                const categories = (athleteFitbitGraphOptions && athleteFitbitGraphOptions.xaxis && Array.isArray(athleteFitbitGraphOptions.xaxis.categories))
                    ? athleteFitbitGraphOptions.xaxis.categories
                    : null;
                if (nearestIdx >= 0 && categories && categories[nearestIdx] !== undefined) return categories[nearestIdx];
                if (nearestIdx >= 0) return (axisTextEls[nearestIdx].textContent || '').trim() || null;
            } catch (e) { /* ignore */ }
            return null;
        };

        const saveDetailOverlayEdit = () => {
            try {
                // Prefer the live DOM content (contentEditable) when available so
                // clicking the Send button saves the current caret/DOM text just
                // like pressing Enter does while editing.
                let raw = '';
                try {
                    const domText = detailOverlayInputRef && detailOverlayInputRef.current && detailOverlayInputRef.current.textContent;
                    if (domText && String(domText).trim()) {
                        raw = String(domText).trim();
                    } else if (detailOverlayEditText && String(detailOverlayEditText).trim()) {
                        raw = String(detailOverlayEditText).trim();
                    }
                } catch (e) {
                    raw = (detailOverlayEditText && String(detailOverlayEditText).trim()) ? String(detailOverlayEditText).trim() : '';
                }
                const finalRaw = raw || 'Detail';
                const truncated = (finalRaw.length >= 10) ? (finalRaw.slice(0,6) + '...') : finalRaw;
                const meta = detailOverlayMeta || {};
                const metricKey = meta.metricKey;
                const chartRef = metricKey ? chartRefs.current[metricKey] : null;

                setAnnotationsByMetric(prev => {
                    if (!metricKey) return prev;
                    const current = (prev[metricKey] || []).slice();
                    // try to resolve category from meta.labelEl first
                    let category = null;
                    if (meta && meta.labelEl) category = resolveCategoryFromLabelEl(meta.labelEl);
                    // try to find existing by category
                    let found = false;
                    if (category !== null) {
                        for (let i = 0; i < current.length; i++) {
                            const a = current[i];
                            if (a && String(a.x) === String(category)) {
                                current[i] = { ...a, fullText: finalRaw, label: { ...(a.label || {}), text: truncated } };
                                found = true; break;
                            }
                        }
                    }
                    // fallback: match by fullText or label text
                    if (!found) {
                        for (let i = 0; i < current.length; i++) {
                            const a = current[i];
                            if (!a) continue;
                            if ((a.fullText && String(a.fullText).trim() === String(detailOverlayText).trim()) || (a.label && String(a.label.text).trim() === String(detailOverlayText).trim())) {
                                current[i] = { ...a, fullText: finalRaw, label: { ...(a.label || {}), text: truncated } };
                                found = true; break;
                            }
                        }
                    }
                    // if still not found, attempt to append a new annotation using resolved category or current overlay text
                    if (!found) {
                        const useX = category || detailOverlayText || finalRaw;
                        const ann = {
                            x: useX,
                            strokeDashArray: 0,
                            borderColor: '#BFACBF',
                            label: {
                                borderColor: '#BFACBF',
                                style: { color: '#E53935', background: '#D9CCD8' },
                                text: truncated
                            },
                            fullText: finalRaw
                        };
                        current.push(ann);
                    }

                    try {
                        if (chartRef && chartRef.chart && typeof chartRef.chart.updateOptions === 'function') {
                            chartRef.chart.updateOptions({ annotations: { xaxis: current } }, false, false);
                        }
                    } catch (e) { /* ignore chart update errors */ }
                    return { ...prev, [metricKey]: current };
                });

            } catch (e) { /* ignore save errors */ }
            // ensure we clear the ignore- blur flag (set on mousedown) so future blurs behave
            try { ignoreBlurRef.current = false; } catch (e) {}
            // close overlay and reset meta/edit buffer
            try { closeDetailOverlay(); } catch (e) {}
        };

        // Ensure the hand cursor shows over detail labels only when placement mode is OFF.
        // (Some ApexCharts SVG nodes can ignore/override CSS cursor rules.)
        useEffect(() => {
            const t = setTimeout(() => {
                try {
                    const selectors = '.apexcharts-annotation-label, .apexcharts-xaxis-annotation-label, .apexcharts-point-annotation-label';
                    ['1', '2', '3', '4', '5'].forEach((metricKey) => {
                        const wrapper = document.querySelector(`.chart-wrapper[data-metric="${metricKey}"]`);
                        if (!wrapper) return;
                        const isPromisMetric = (metricKey === '4' || metricKey === '5');
                        const placementOn = isPromisMetric ? promisPlacingEvent : placingEvent;
                        const cursor = placementOn ? '' : 'pointer';

                        const labelEls = Array.from(wrapper.querySelectorAll(selectors));
                        labelEls.forEach((el) => {
                            try {
                                el.style.cursor = cursor;
                                // Apply to SVG children like <rect>/<text>/<tspan>
                                Array.from(el.querySelectorAll('*')).forEach((child) => {
                                    try { child.style.cursor = cursor; } catch (e) {}
                                });
                            } catch (e) {
                                // ignore per element
                            }
                        });

                        // Extra fallback: the Detail label background <rect> can be generated
                        // outside the label-class wrappers. It uses the configured stroke/fill.
                        Array.from(wrapper.querySelectorAll('svg rect[stroke="#bfacbf"][fill="#D9CCD8"], svg rect[stroke="#bfacbf"][fill="#d9ccd8"]')).forEach((rect) => {
                            try { rect.style.cursor = cursor; } catch (e) {}
                        });
                    });
                } catch (e) {
                    // ignore
                }
            }, 0);
            return () => clearTimeout(t);
        }, [placingEvent, promisPlacingEvent, annotationsByMetric]);

        // When entering edit mode: set DOM content once, focus and place caret at end.
        useEffect(() => {
            if (detailOverlayEditing && detailOverlayInputRef.current) {
                try {
                    const el = detailOverlayInputRef.current;
                    // set initial content from the edit buffer without rendering it as React child
                    el.textContent = detailOverlayEditText || detailOverlayText || '';
                    el.focus();
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } catch (e) { /* ignore focus errors */ }
            }
        }, [detailOverlayEditing]);

        const overviewOptions = {
            chart: {
                height: 50,
                type: 'line',
                toolbar: { show: false },
                events: {
                    mounted: function(chartContext, config) {
                        try {
                            const draw = function() {
                                try {
                                    const container = chartContext.el;
                                    if (!container) return;
                                    // remove old guideline lines
                                    Array.from(container.querySelectorAll('.overview-guideline')).forEach(n=>n.remove());
                                    const svg = container.querySelector('svg');
                                    if (!svg) return;
                                    const svgRect = svg.getBoundingClientRect();
                                    // compute a baseline near the bottom of the SVG so guidelines run up from the x-axis area
                                    const basePageY = svgRect.top + svgRect.height - 6;
                                    const markers = Array.from(container.querySelectorAll('.apexcharts-marker'));
                                    if (!markers.length) return;
                                    const pt = svg.createSVGPoint();
                                    const transformToSvg = function(pageX, pageY) {
                                        pt.x = pageX; pt.y = pageY;
                                        return pt.matrixTransform(svg.getScreenCTM().inverse());
                                    };
                                    markers.forEach(marker => {
                                        const b = marker.getBoundingClientRect();
                                        const cxPage = b.left + b.width/2;
                                        const cyPage = b.top + b.height/2;
                                        const topSvg = transformToSvg(cxPage, basePageY);
                                        // draw line ending slightly below the marker so it doesn't overlap the dot
                                        const markerRadiusPage = Math.max(2, b.height / 2);
                                        const endPageY = cyPage + markerRadiusPage * 0.6; // push end below center
                                        const ptSvg = transformToSvg(cxPage, endPageY);
                                        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
                                        line.setAttribute('x1', topSvg.x);
                                        line.setAttribute('x2', topSvg.x);
                                        line.setAttribute('y1', topSvg.y);
                                        line.setAttribute('y2', ptSvg.y);
                                        line.setAttribute('stroke', 'rgba(0,0,0,0.28)');
                                        line.setAttribute('stroke-dasharray', '4');
                                        line.setAttribute('stroke-width', '1.5');
                                        line.classList.add('overview-guideline');
                                        svg.appendChild(line);
                                    });
                                } catch(e) { console.warn('draw guidelines error', e); }
                            };
                            // initial draw and after a slight delay for layout
                            draw();
                            setTimeout(draw, 120);
                            // redraw on window resize
                            const onResize = () => draw();
                            window.addEventListener('resize', onResize);
                            // store listener so it can be cleaned up if necessary
                            chartContext.el.__overview_guideline_resize = onResize;
                        } catch(e) { console.warn(e); }
                    },
                    updated: function(chartContext, config) {
                        try {
                            // remove old lines then redraw
                            Array.from(chartContext.el.querySelectorAll('.overview-guideline')).forEach(n=>n.remove());
                            // reuse the mounted logic by dispatching a small timeout
                            setTimeout(function(){
                                try {
                                    const container = chartContext.el;
                                    const svg = container.querySelector('svg');
                                    if (!svg) return;
                                    const svgRect = svg.getBoundingClientRect();
                                    const basePageY = svgRect.top + svgRect.height - 6;
                                    const markers = Array.from(container.querySelectorAll('.apexcharts-marker'));
                                    if (!markers.length) return;
                                    const pt = svg.createSVGPoint();
                                    const transformToSvg = function(pageX, pageY) {
                                        pt.x = pageX; pt.y = pageY;
                                        return pt.matrixTransform(svg.getScreenCTM().inverse());
                                    };
                                    markers.forEach(marker => {
                                        const b = marker.getBoundingClientRect();
                                        const cxPage = b.left + b.width/2;
                                        const cyPage = b.top + b.height/2;
                                        const topSvg = transformToSvg(cxPage, basePageY);
                                        // draw line ending slightly below the marker so it doesn't overlap the dot
                                        const markerRadiusPage = Math.max(2, b.height / 2);
                                        const endPageY = cyPage + markerRadiusPage * 0.6; // push end below center
                                        const ptSvg = transformToSvg(cxPage, endPageY);
                                        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
                                        line.setAttribute('x1', topSvg.x);
                                        line.setAttribute('x2', topSvg.x);
                                        line.setAttribute('y1', topSvg.y);
                                        line.setAttribute('y2', ptSvg.y);
                                        line.setAttribute('stroke', 'rgba(0,0,0,0.28)');
                                        line.setAttribute('stroke-dasharray', '4');
                                        line.setAttribute('stroke-width', '1.5');
                                        line.classList.add('overview-guideline');
                                        svg.appendChild(line);
                                    });
                                } catch(e) { console.warn('updated draw error', e); }
                            }, 40);
                        } catch(e) { console.warn(e); }
                    }
                }
            },
            colors: ["#E53935"],
            stroke: {
                width: 2,
                curve: 'smooth',
                colors: ['rgba(229,57,53,1)']
            },
            markers: {
                size: 6,
                colors: ["#E53935"],
                strokeWidth: 2,
                strokeColors: '#ffffff',
                hover: { size: 8 }
            },
            dataLabels: { enabled: false },
            legend: { show: false },
            grid: { show: false },
            yaxis: { min: 0, max: 100, show: false },
            xaxis: {
                labels: { show: false },
                axisTicks: { show: false },
                position: 'bottom'
            },
            tooltip: {
                enabled: true,
                shared: false,
                followCursor: true,
                theme: 'light',
                x: { show: false },
                y: {
                    formatter: function(val) { return val; }
                },
                marker: { show: true },
                custom: function(opts) {
                    try {
                        const series = opts.series || [];
                        const seriesIndex = opts.seriesIndex;
                        const dataPointIndex = opts.dataPointIndex;
                        const w = opts.w || {};
                        const seriesName = (w.config && w.config.series && w.config.series[seriesIndex] && w.config.series[seriesIndex].name) || '';
                        // prefer the original value (un-normalized) if the series object contains it
                        let pointVal = '';
                        try {
                            const seriesObj = (w.config && w.config.series && w.config.series[seriesIndex]) || null;
                            if (seriesObj && Array.isArray(seriesObj.originalData) && seriesObj.originalData[dataPointIndex] !== undefined) {
                                pointVal = seriesObj.originalData[dataPointIndex];
                            } else if (series[seriesIndex] && series[seriesIndex][dataPointIndex] !== undefined) {
                                pointVal = series[seriesIndex][dataPointIndex];
                            }
                        } catch (e) {
                            pointVal = (series[seriesIndex] && series[seriesIndex][dataPointIndex] !== undefined) ? series[seriesIndex][dataPointIndex] : '';
                        }
                        const pointNum = (dataPointIndex !== undefined && dataPointIndex !== null) ? (dataPointIndex + 1) : '';
                        const color = (w.config && w.config.colors && w.config.colors[seriesIndex]) || '#E53935';

                        return "" +
                            '<div style="font-family: Roboto, sans-serif; max-width:220px;">' +
                              '<div style="background:#f2f4f6;padding:8px 12px;border-top-left-radius:6px;border-top-right-radius:6px;text-align:center;font-weight:600;">' + pointNum + '</div>' +
                              '<div style="background:#fff;padding:10px 12px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;display:flex;align-items:center;">' +
                                '<span style="display:inline-block;width:10px;height:10px;background:' + color + ';border-radius:50%;margin-right:8px;vertical-align:middle;"></span>' +
                                '<span style="font-size:13px;color:#333;">' + (seriesName ? (seriesName + ': ') : '') + '<strong>' + pointVal + '</strong></span>' +
                              '</div>' +
                            '</div>';
                    } catch (e) {
                        return '';
                    }
                }
            },
            /* annotations removed: using custom SVG guidelines instead */
            fill: { opacity: 0 }
        }

        // normalize each mini-series to a common 0-100 range so markers align horizontally
        const makeOverviewSeries = (orig) => {
            const data = orig.slice(-3);
            const min = Math.min(...data);
            const max = Math.max(...data);
            let normalized;
            if (max === min) {
                normalized = data.map(() => 50);
            } else {
                normalized = data.map(v => ((v - min) / (max - min)) * 100);
            }
            return { name: '', type: 'line', data: normalized, originalData: data };
        };

        const metricOverview = [
            Object.assign(makeOverviewSeries(athleteData[props.index].metricData[0].data), { name: 'Recent Step Count' }),
            Object.assign(makeOverviewSeries(athleteData[props.index].metricData[1].data), { name: 'Recent Heart Rate' }),
            Object.assign(makeOverviewSeries(athleteData[props.index].metricData[2].data), { name: 'Recent Hrs of Rest' })
        ];

        const averageData = [
            {
                name: "Average Step Count",
                data: [3000, 2000, 1000, 1000, 1500, 2000, 2700, 3000, 3000, 3500, 4000, 5000, 6500, 7000, 7000, 8000]
            },
            {
                name: "Average Heart Rate",
                data: [100, 101, 100, 115, 105, 100, 95, 92, 89, 89, 90, 80, 85, 85, 84, 82]
            },
            {
                name: "Average Hrs of Rest",
                data: [5, 5, 6, 7, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 9, 8]
            },
            {
                name: "Activeness",
                data: [50, 50, 60, 70, 60, 60, 70, 70, 80, 80, 80, 90, 90, 90, 90, 80]
            },
            {
                name: "Pain",
                data: [50, 50, 60, 70, 60, 60, 70, 70, 80, 80, 80, 90, 90, 90, 90, 80]
            },
        ]

                var stepCountOptions = {
                        series: [{
                                name: 'Step Count',
                                type: 'column',
                                data: stepCountData[props.index].data
                            }, {
                                name: 'Average',
                                type: 'area',
                                data: averageData[0].data
                            }],
                        options: {
                                ...athleteFitbitGraphOptions,
                                // disable markers for the Average series (second series)
                                markers: {
                                        ...athleteFitbitGraphOptions.markers,
                                        size: [ (athleteFitbitGraphOptions.markers && athleteFitbitGraphOptions.markers.size) ? athleteFitbitGraphOptions.markers.size : 4, 0 ]
                                }
                        }
                }

                var heartRateOptions = {
                        series: [{
                                name: 'Heart Rate',
                                type: 'column',
                                data: heartRateData[props.index].data
                            }, {
                                name: 'Average',
                                type: 'area',
                                data: averageData[1].data
                            }],
                        options: {
                                ...athleteFitbitGraphOptions,
                                markers: {
                                        ...athleteFitbitGraphOptions.markers,
                                        size: [ (athleteFitbitGraphOptions.markers && athleteFitbitGraphOptions.markers.size) ? athleteFitbitGraphOptions.markers.size : 4, 0 ]
                                }
                        }
                }

                var hrsOfSleepOptions = {
                        series: [{
                                name: 'Hrs of Rest',
                                type: 'column',
                                data: hrsOfSleepData[props.index].data
                            }, {
                                name: 'Average',
                                type: 'area',
                                data: averageData[2].data
                            }],
                        options: {
                            ...athleteFitbitGraphOptions,
                            markers: {
                                ...athleteFitbitGraphOptions.markers,
                                size: [ (athleteFitbitGraphOptions.markers && athleteFitbitGraphOptions.markers.size) ? athleteFitbitGraphOptions.markers.size : 4, 0 ]
                            }
                        }
                }

                var pfOptions = {
                        series: [{
                                name: 'Activeness',
                                type: 'column',
                                data: physicalFuncData[props.index].data
                            }, {
                                name: 'Average',
                                type: 'area',
                                data: averageData[3].data
                            }],
                        options: {
                            ...athleteFitbitGraphOptions,
                            markers: {
                                ...athleteFitbitGraphOptions.markers,
                                size: [ (athleteFitbitGraphOptions.markers && athleteFitbitGraphOptions.markers.size) ? athleteFitbitGraphOptions.markers.size : 4, 0 ]
                            }
                        }
                }

                var piOptions = {
                        series: [{
                                name: 'Pain',
                                type: 'column',
                                data: painInterData[props.index].data
                            }, {
                                name: 'Average',
                                type: 'area',
                                data: averageData[4].data
                            }],
                        options: {
                            ...athleteFitbitGraphOptions,
                            markers: {
                                ...athleteFitbitGraphOptions.markers,
                                size: [ (athleteFitbitGraphOptions.markers && athleteFitbitGraphOptions.markers.size) ? athleteFitbitGraphOptions.markers.size : 4, 0 ]
                            }
                        }
                }

        const metrics = [
            {
              key: '1',
              label: `Step Count`,
                            children: <div className={`chart-wrapper ${placingEvent ? 'placing-detail' : 'view-detail'}`} data-metric="1" onClickCapture={(e)=>onChartClickCapture(e, '1')} onMouseMove={(e)=>onChartMouseMove(e)} onMouseLeave={(e)=>onChartMouseLeave(e)} onClick={(e)=>onChartClick(e, '1')}>
                                <div ref={previewRef} className="chart-preview-line" style={{display: placingEvent ? 'block' : 'none'}}></div>
                                <Chart ref={c=>chartRefs.current['1']=c} options={{...stepCountOptions.options, annotations: { xaxis: (eventsHidden ? [] : annotationsByMetric['1']) }}} series={stepCountOptions.series} type="bar" height={350}></Chart>
                            </div>,
            },
            {
              key: '2',
              label: `Heart Rate`,
                            children: <div className={`chart-wrapper ${placingEvent ? 'placing-detail' : 'view-detail'}`} data-metric="2" onClickCapture={(e)=>onChartClickCapture(e, '2')} onMouseMove={(e)=>onChartMouseMove(e)} onMouseLeave={(e)=>onChartMouseLeave(e)} onClick={(e)=>onChartClick(e, '2')}>
                                <div className="chart-preview-line" style={{display: placingEvent ? 'block' : 'none'}}></div>
                                <Chart ref={c=>chartRefs.current['2']=c} options={{...heartRateOptions.options, annotations: { xaxis: (eventsHidden ? [] : annotationsByMetric['2']) }}} series={heartRateOptions.series} type="bar" height={350}></Chart>
                            </div>,
            },
                        {
                            key: '3',
                            label: `Rest`,
                            children: <div className={`chart-wrapper ${placingEvent ? 'placing-detail' : 'view-detail'}`} data-metric="3" onClickCapture={(e)=>onChartClickCapture(e, '3')} onMouseMove={(e)=>onChartMouseMove(e)} onMouseLeave={(e)=>onChartMouseLeave(e)} onClick={(e)=>onChartClick(e, '3')}>
                                <div className="chart-preview-line" style={{display: placingEvent ? 'block' : 'none'}}></div>
                                <Chart ref={c=>chartRefs.current['3']=c} options={{...hrsOfSleepOptions.options, annotations: { xaxis: (eventsHidden ? [] : annotationsByMetric['3']) }}} series={hrsOfSleepOptions.series} type="bar" height={350}></Chart>
                            </div>,
                        },
                        {
                            key: '4',
                            label: <span className={`event-toggle ${placingEvent ? 'active' : ''}`}>Detail</span>,
                            children: <div style={{padding: 12, color: '#666'}}>{placingEvent ? 'Detail placement mode active — click on a chart to add details.' : 'Click Detail to enable placement mode.'}</div>
                        },
          ];

        // handlers for chart interactivity
        function onChartMouseMove(e) {
            const wrapper = e.currentTarget;
            const metricKeyAttr = wrapper && wrapper.getAttribute ? wrapper.getAttribute('data-metric') : null;
            let allowed;
            // metrics 4 and 5 are PROMIS charts (Activeness and Pain) — use shared PROMIS placing mode
            if (metricKeyAttr === '4' || metricKeyAttr === '5') allowed = promisPlacingEvent;
            else allowed = placingEvent;
            if (!allowed) return;
            const preview = wrapper.querySelector('.chart-preview-line');
            if (!preview) return;
            // position preview line at mouse X relative to wrapper
            // snap preview to nearest x-axis label so placement preview
            // matches where the annotation will be placed on click
            const rect = wrapper.getBoundingClientRect();
            const labels = Array.from(wrapper.querySelectorAll('.apexcharts-xaxis-texts-g text'));
            let x;
            if (labels.length) {
                let nearestCenter = null;
                let nearestDist = Infinity;
                labels.forEach(l => {
                    const bbox = l.getBoundingClientRect();
                    const cx = bbox.left + bbox.width / 2;
                    const dist = Math.abs(e.clientX - cx);
                    if (dist < nearestDist) { nearestDist = dist; nearestCenter = cx; }
                });
                if (nearestCenter === null) {
                    x = e.clientX - rect.left;
                } else {
                    x = nearestCenter - rect.left;
                }
            } else {
                x = e.clientX - rect.left;
            }
            // no special per-chart offset here; snapping to nearest label
            // should align with where annotations are placed.
            preview.style.left = x + 'px';
            preview.style.display = 'block';
        }

        function onChartMouseLeave(e) {
            const wrapper = e.currentTarget;
            const preview = wrapper.querySelector('.chart-preview-line');
            if (preview) preview.style.display = 'none';
        }

        function onChartClickCapture(e, metricKey) {
            const isPromisMetric = (String(metricKey) === '4' || String(metricKey) === '5');
            const placementOn = isPromisMetric ? promisPlacingEvent : placingEvent;
            if (placementOn) return;

            try {
                const wrapper = e && e.currentTarget;
                const target = e && e.target;
                if (!wrapper || !target) return;

                const selectors = '.apexcharts-annotation-label, .apexcharts-xaxis-annotation-label, .apexcharts-point-annotation-label';

                // `closest` can be unreliable for some SVG nodes depending on browser/runtime.
                // Prefer it when available, otherwise walk up the DOM tree manually.
                let labelEl = null;
                if (typeof target.closest === 'function') {
                    labelEl = target.closest(selectors);
                }

                if (!labelEl) {
                    let el = target;
                    while (el && el !== wrapper) {
                        if (el.matches && typeof el.matches === 'function' && el.matches(selectors)) {
                            labelEl = el;
                            break;
                        }
                        el = (el.parentNode && el.parentNode.nodeType === 1) ? el.parentNode : null;
                    }
                }

                // Final fallback: find the rendered label element that contains the clicked node.
                // This covers cases where SVGElement.closest/matches behave unexpectedly.
                if (!labelEl) {
                    const candidates = Array.from(wrapper.querySelectorAll(selectors));
                    labelEl = candidates.find(el => el === target || (el.contains && el.contains(target))) || null;
                }

                if (!labelEl) return;

                const full = (labelEl.getAttribute && (labelEl.getAttribute('data-fulltext') || ''))
                    || (labelEl.textContent || '');
                const trimmed = String(full).trim();
                if (!trimmed) return;

                openDetailOverlayAtLabel(labelEl, trimmed, { metricKey, labelEl });
                e.preventDefault();
                e.stopPropagation();
            } catch (err) {
                // ignore
            }
        }

        function onChartClick(e, metricKey) {
            const isPromisMetric = (String(metricKey) === '4' || String(metricKey) === '5');
            if (isPromisMetric && !promisPlacingEvent) return;
            if (!isPromisMetric && !placingEvent) return;
            const wrapper = e.currentTarget;
            const svg = wrapper.querySelector('svg');
            if (!svg) return;
            const pt = svg.createSVGPoint();
            // convert page x to svg coord (not used further here, so just compute if needed)
            pt.x = e.clientX; pt.y = e.clientY;
            // find x-axis category label positions
            const labels = Array.from(wrapper.querySelectorAll('.apexcharts-xaxis-texts-g text'));
            if (!labels.length) return;
            // find nearest label by its transform or x attribute
            let nearest = null; let nearestDist = Infinity;
            labels.forEach(l => {
                const bbox = l.getBoundingClientRect();
                const cx = bbox.left + bbox.width/2;
                const dist = Math.abs(e.clientX - cx);
                if (dist < nearestDist) { nearestDist = dist; nearest = l; }
            });
            if (!nearest) return;
            const weekText = nearest.textContent;
            // Sometimes Apex wraps label text into nested tspans or duplicates nodes
            // (e.g. "Event 1Event 1"), so instead of relying on regex matching
            // against the text content, prefer resolving the category by the
            // label element index. This is more robust across label formats.
            let cleanWeek = weekText;
            let categoryIndex = -1;
            try {
                const allCategories = (athleteFitbitGraphOptions && athleteFitbitGraphOptions.xaxis && Array.isArray(athleteFitbitGraphOptions.xaxis.categories))
                    ? athleteFitbitGraphOptions.xaxis.categories
                    : null;
                const labelIndex = labels.indexOf(nearest);
                if (labelIndex >= 0 && allCategories && allCategories[labelIndex] !== undefined) {
                    categoryIndex = labelIndex;
                    cleanWeek = allCategories[labelIndex];
                } else {
                    // fallback: try to extract an "Event N" or "Week N" token from the text
                    const mEvent = (weekText || '').match(/Event\s*-?\d+/i);
                    const mWeek = (weekText || '').match(/Week\s*-?\d+/i);
                    const mNum = (weekText || '').match(/-?\d+/);
                    if (mEvent) cleanWeek = mEvent[0];
                    else if (mWeek) cleanWeek = mWeek[0];
                    else if (mNum && allCategories) {
                        // if only a number is present, try mapping it to a category by number
                        const n = parseInt(mNum[0], 10);
                        // attempt to find a category that ends with that number
                        const byNumIndex = allCategories.findIndex(c => String(c).match(new RegExp("\\b" + n + "\\b")));
                        if (byNumIndex >= 0) { categoryIndex = byNumIndex; cleanWeek = allCategories[byNumIndex]; }
                    }
                    if (categoryIndex === -1 && allCategories) {
                        categoryIndex = allCategories.indexOf(cleanWeek);
                    }
                }
            } catch (e) {
                // fall back to naive approach
                const match = (weekText || '').match(/Week\s*-?\d+/i);
                cleanWeek = match ? match[0] : weekText;
                categoryIndex = (athleteFitbitGraphOptions && athleteFitbitGraphOptions.xaxis && Array.isArray(athleteFitbitGraphOptions.xaxis.categories))
                    ? athleteFitbitGraphOptions.xaxis.categories.indexOf(cleanWeek)
                    : -1;
            }

            // debug logging to help diagnose runtime issues
            try { console.log('Detail click', { metricKey, weekText, cleanWeek, categoryIndex, labelsCount: labels.length, nearestText: nearest.textContent }); } catch (e) {}

            // create annotation object
            const ann = {
                // use the cleaned category label string (e.g. "Week 3") so ApexCharts snaps to the category correctly
                x: cleanWeek,
                strokeDashArray: 0,
                borderColor: '#BFACBF',
                label: {
                    borderColor: '#BFACBF',
                    style: {
                        color: '#E53935',
                        background: '#D9CCD8'
                    },
                    text: 'Detail'
                }
            };
            // toggle behavior: if annotation exists remove it; otherwise prompt for a label and add
            const chartRef = chartRefs.current[metricKey];
            const existsNow = (annotationsByMetric[metricKey] || []).some(a => a && String(a.x) === String(cleanWeek));
            if (existsNow) {
                // remove using freshest prev inside updater and update chart
                setAnnotationsByMetric(prev => {
                    const current = (prev[metricKey] || []);
                    const arr = current.filter(a => !(a && String(a.x) === String(cleanWeek)));
                    try {
                        if (chartRef && chartRef.chart && typeof chartRef.chart.updateOptions === 'function') {
                            chartRef.chart.updateOptions({ annotations: { xaxis: arr } }, false, false);
                        }
                    } catch (e) { /* ignore chart update errors */ }
                    return { ...prev, [metricKey]: arr };
                });
                return;
            }

            // not existing: create an inline input at the clicked week so user can type the label and press Enter
            try {
                const rect = wrapper.getBoundingClientRect();
                const labelBbox = nearest.getBoundingClientRect();
                const cx = labelBbox.left + labelBbox.width / 2;
                const leftPx = cx - rect.left;
                const input = document.createElement('input');
                input.className = 'annotation-input';
                input.type = 'text';
                input.placeholder = 'Detail Label';
                input.style.position = 'absolute';
                input.style.left = leftPx + 'px';
                input.style.top = '8px';
                input.style.transform = 'translateX(-50%)';
                input.style.zIndex = 9999;
                input.style.minWidth = '80px';
                input.style.padding = '4px 8px';
                wrapper.appendChild(input);
                input.focus();

                const cleanup = () => { try { input.remove(); } catch (e) {} };

                const commit = (val) => {
                    const raw = (val && String(val).trim()) ? String(val).trim() : 'Detail';
                    const text = (raw.length >= 10) ? (raw.slice(0,6) + '...') : raw;
                    ann.label.text = text;
                    ann.fullText = raw;
                    // update state and chart using freshest state inside updater
                    setAnnotationsByMetric(prev => {
                        const current = (prev[metricKey] || []).slice();
                        current.push(ann);
                        try {
                            if (chartRef && chartRef.chart && typeof chartRef.chart.updateOptions === 'function') {
                                chartRef.chart.updateOptions({ annotations: { xaxis: current } }, false, false);
                            }
                        } catch (e) { console.warn('updateOptions failed', e); }
                        return { ...prev, [metricKey]: current };
                    });
                    cleanup();
                };

                const onKey = (ev) => {
                    if (ev.key === 'Enter') {
                        commit(input.value);
                    } else if (ev.key === 'Escape') {
                        cleanup();
                    }
                };
                input.addEventListener('keydown', onKey);
                // cancel on blur without committing
                input.addEventListener('blur', () => { cleanup(); });
            } catch (e) {
                // fallback to prompt if DOM operations fail
                try {
                    const labelText = window.prompt('Enter detail label for ' + cleanWeek + ':', 'Detail');
                    if (labelText === null) return;
                    const raw = (labelText && String(labelText).trim()) ? String(labelText).trim() : 'Detail';
                    ann.label.text = (raw.length >= 10) ? (raw.slice(0,6) + '...') : raw;
                    ann.fullText = raw;
                    setAnnotationsByMetric(prev => {
                        const current = (prev[metricKey] || []).slice();
                        current.push(ann);
                        try {
                            if (chartRef && chartRef.chart && typeof chartRef.chart.updateOptions === 'function') {
                                chartRef.chart.updateOptions({ annotations: { xaxis: current } }, false, false);
                            }
                        } catch (e) { console.warn('updateOptions failed', e); }
                        return { ...prev, [metricKey]: current };
                    });
                } catch (err) { /* ignore */ }
            }
            // keep placing mode on so user can add more; hide preview briefly
        }
    
        return (
        <Content id="patient">
            {detailOverlayText ? (
                <div
                    className="detail-overlay-backdrop"
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={(ev) => {
                        if (ev.target === ev.currentTarget) closeDetailOverlay();
                    }}
                >
                    <div
                        className={`detail-overlay-box ${detailOverlayPos && detailOverlayPos.placement ? `pos-${detailOverlayPos.placement}` : 'pos-above'} ${detailOverlayPos && detailOverlayPos.side ? `side-${detailOverlayPos.side}` : 'side-right'}`}
                        style={detailOverlayPos ? { left: detailOverlayPos.left, top: detailOverlayPos.top } : undefined}
                    >
                        <div className="detail-overlay-box-header">Detail</div>
                        <div className="detail-overlay-box-body" onClick={(e)=>{
                            if (!detailOverlayEditing) setDetailOverlayEditing(true);
                        }}>
                            <div
                                ref={detailOverlayInputRef}
                                className="detail-overlay-text"
                                contentEditable={detailOverlayEditing}
                                suppressContentEditableWarning={true}
                                tabIndex={0}
                                onInput={(e) => { try { setDetailOverlayEditText((e.currentTarget && e.currentTarget.textContent) || ''); } catch (err) {} }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        try { closeDetailOverlay(); } catch (err) {}
                                    } else if (e.key === 'Enter') {
                                        e.preventDefault();
                                        saveDetailOverlayEdit();
                                    }
                                }}
                                onBlur={() => {
                                        if (ignoreBlurRef.current) {
                                            // Click happened on the action buttons; don't wipe edits now.
                                            // Clear the flag on the next tick so subsequent blurs behave normally.
                                            setTimeout(() => { ignoreBlurRef.current = false; }, 0);
                                            return;
                                        }
                                        if (detailOverlayEditing) {
                                            setDetailOverlayEditing(false);
                                            setDetailOverlayEditText(detailOverlayText);
                                            try { if (detailOverlayInputRef.current) detailOverlayInputRef.current.textContent = detailOverlayText; } catch (e) {}
                                        }
                                    }}
                            >{!detailOverlayEditing ? detailOverlayText : null}</div>
                        </div>

                        <div className="detail-overlay-actions" onMouseDown={(e)=>{ e.stopPropagation(); ignoreBlurRef.current = true; }}>
                            <button
                                type="button"
                                className="detail-overlay-action cancel"
                                aria-label="Cancel"
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); try { closeDetailOverlay(); } catch (err) {} }}
                            ></button>
                            <button
                                type="button"
                                className="detail-overlay-action send"
                                aria-label="Send"
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); try { saveDetailOverlayEdit(); } catch (err) {} }}
                            ></button>
                        </div>
                    </div>
                </div>
            ) : null}
            <Card className="patient-header card" size="large">
                <Row className="patient-header-row" align="middle">
                    <Col span={4} style={{textAlign: 'left'}}>
                        <Link to="/" className="patient-back-link">
                            <ArrowLeftOutlined style={{fontSize: "20px", fontWeight: "800", color: "black"}} />
                        </Link>
                    </Col>
                    <Col span={16} style={{textAlign: 'center'}}>
                        <Title level={2} style={{margin: 0, marginLeft: -30}}>{athleteData[props.index].name}</Title>
                    </Col>
                    <Col span={4}></Col>
                </Row>
                <Row className="patient-header-summary">
                    <Col span={4} className="patient-header-summary-profile">
                        <div className="patient-header-summary-profile-row" >
                            <Title level={5} style={{color: "#595959", marginTop: "0"}}>DOB:</Title>
                            <Title level={5} style={{color: "gray", marginTop: "0"}}>{athleteData[props.index].dob}</Title>
                        </div>
                        <div className="patient-header-summary-profile-row" >
                            <Title level={5} style={{color: "#595959", marginTop: "0"}}>Age:</Title>
                            <Title level={5} style={{color: "gray", marginTop: "0"}}>{athleteData[props.index].age}</Title>
                        </div>
                        <div className="patient-header-summary-profile-row">
                            <Title level={5} style={{color: "#595959", marginTop: "0"}}>Event #:</Title>
                            <Title level={5} style={{color: "gray", marginTop: "0"}}>{athleteData[props.index].currentWeek}</Title>
                        </div>
                        <div className="patient-header-summary-profile-row">
                            <Title level={5} style={{color: "#595959", marginTop: "0"}}>Phone:</Title>
                            <Title level={5} style={{color: "gray", marginTop: "0"}}>{athleteData[props.index].phone}</Title>
                        </div>
                    </Col>
                    <Col span={15} className="patient-metric-summaries">
                        <div className="patient-metric-summary">
                            <div className='patient-card-metric-info'>
                                <Title style={{color: 'gray', fontWeight: 'normal', marginBottom: 0}} className="patient-card-metric" level={5}>Daily Steps</Title>
                                <Tooltip placement="top" title={"lorem ipsum dolor"}><QuestionCircleOutlined /></Tooltip>
                            </div>
                            <div className='patient-card-metric-stat'>
                                <Title level={4} style={{margin: 0}}>{athleteData[props.index].metricData[0].avg}</Title>
                                <Title level={5} style={{fontWeight: 'normal', margin: 0}}>{athleteData[props.index].metricData[0].percentage}% {athleteData[props.index].metricData[0].arrow === "down" ? <CaretDownOutlined style={{color: "#f37f89"}}/> : (athleteData[props.index].metricData[0].arrow === "mid" ? <MinusOutlined style={{color: "#acacac"}}/>: <CaretUpOutlined style={{color: "#52c41a"}}/>)} </Title>
                            </div>
                            {/* <img className="image" src={image} alt="flow"></img> */}
                            <Chart options={overviewOptions} series={[metricOverview[0]]} type="line" height={120}></Chart>
                        </div>
                        <div className="patient-metric-summary">
                            <div className='patient-card-metric-info'>
                                <Title style={{color: 'gray', fontWeight: 'normal', marginBottom: 0}} className="patient-card-metric" level={5}>Heart Rate</Title>
                                <Tooltip placement="top" title={"lorem ipsum dolor"}><QuestionCircleOutlined /></Tooltip>
                            </div>
                            <div className='patient-card-metric-stat'>
                                <Title level={4} style={{margin: 0}}>{athleteData[props.index].metricData[1].avg}</Title>
                                <Title level={5} style={{fontWeight: 'normal', margin: 0}}>{athleteData[props.index].metricData[1].percentage}% {athleteData[props.index].metricData[1].arrow === "down" ? <CaretDownOutlined style={{color: "#52c41a"}}/> : (athleteData[props.index].metricData[1].arrow === "mid" ? <MinusOutlined style={{color: "#acacac"}}/>: <CaretUpOutlined style={{color: "#f37f89"}}/>)} </Title>
                            </div>
                            {/* <img className="image" src={image} alt="flow"></img> */}
                            <Chart options={overviewOptions} series={[metricOverview[1]]} type="line" height={120}></Chart>
                        </div>
                        <div className="patient-metric-summary">
                            <div className='patient-card-metric-info'>
                                <Title style={{color: 'gray', fontWeight: 'normal', marginBottom: 0}} className="patient-card-metric" level={5}>Hours of Rest</Title>
                                <Tooltip placement="top" title={"lorem ipsum dolor"}><QuestionCircleOutlined /></Tooltip>
                            </div>
                            <div className='patient-card-metric-stat'>
                                <Title level={4} style={{margin: 0}}>{athleteData[props.index].metricData[2].avg}</Title>
                                <Title level={5} style={{fontWeight: 'normal', margin: 0}}>{athleteData[props.index].metricData[2].percentage}% {athleteData[props.index].metricData[2].arrow === "down" ? <CaretDownOutlined style={{color: "#f37f89"}}/> : (athleteData[props.index].metricData[2].arrow === "mid" ? <MinusOutlined style={{color: "#acacac"}}/>: <CaretUpOutlined style={{color: "#52c41a"}}/>)} </Title>
                            </div>
                            {/* <img className="image" src={image} alt="flow"></img> */}
                            <Chart options={overviewOptions} series={[metricOverview[2]]} type="line" height={120}></Chart>
                        </div>
                    </Col>
                </Row>
            </Card>
            <Card className="card">
                <Row>
                        <Col span={24} className="patient-fitbit-title" >
                            <Title level={3}>Monitor Device Data</Title>
                                        <div className="patient-fitbit-options">
                                            <Segmented options={['Last Week', 'Last Month', 'Last 3 Months']} value={value} onChange={setValue} className="patient-fitbit-segmented"/>
                                            <Button className="hide-events-btn" onClick={() => setEventsHidden(h => !h)}>
                                                {eventsHidden ? 'Show Details' : 'Hide Details'}
                                            </Button>
                                        </div>
                        </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Tabs id="metric-tabs" className="tabs" activeKey={activeMetricKey} onTabClick={(k)=>{
                            if (k === '4') {
                                setPlacingEvent(p => {
                                    const next = !p;
                                    if (next) setPromisPlacingEvent(false);
                                    return next;
                                });
                                // keep the active metric tab selected
                                return;
                            }
                            setActiveMetricKey(k);
                            // turning off placing mode when switching to a metric
                            setPlacingEvent(false);
                            setPromisPlacingEvent(false);
                        }} items={metrics} />
                    </Col>
                </Row>
            </Card>
            <Card className="card">
                <Row>
                    <Col span={24} className="patient-fitbit-title" >
                            <Title level={3}>PROMIS Data</Title>
                            <div className="patient-fitbit-options">
                                <Segmented options={['Last Week', 'Last Month', 'Last 3 Months']} value={value} onChange={setValue} className="patient-fitbit-segmented"/>
                                <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                                    <Button className="hide-events-btn" onClick={() => setPromisEventsHidden(h => !h)}>
                                        {promisEventsHidden ? 'Show Details' : 'Hide Details'}
                                    </Button>
                                </div>
                            </div>
                        </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Tabs className="promis-tabs" activeKey={promisActiveMetric} onTabClick={(k)=>{
                            // If user clicked the Detail tab, toggle placement mode and keep current chart
                            if (k === 'd') {
                                setPromisPlacingEvent(p => !p);
                                return;
                            }
                            setPromisActiveMetric(k);
                            setPromisPlacingEvent(false);
                        }} items={[
                            {
                                key: '4',
                                label: 'Activeness',
                                children: (
                                    <div className={`chart-wrapper ${promisPlacingEvent ? 'placing-detail' : 'view-detail'}`} data-metric="4" onClickCapture={(e)=>onChartClickCapture(e, '4')} onMouseMove={(e)=>onChartMouseMove(e)} onMouseLeave={(e)=>onChartMouseLeave(e)} onClick={(e)=>onChartClick(e, '4')}>
                                        <div className="chart-preview-line" style={{display: (promisPlacingEvent) ? 'block' : 'none'}}></div>
                                        <Chart ref={c=>chartRefs.current['4']=c} options={{...pfOptions.options, annotations: { xaxis: (promisEventsHidden ? [] : annotationsByMetric['4']) }}} series={pfOptions.series} type="bar" height={400}></Chart>
                                    </div>
                                )
                            },
                            {
                                key: '5',
                                label: 'Pain',
                                children: (
                                    <div className={`chart-wrapper ${promisPlacingEvent ? 'placing-detail' : 'view-detail'}`} data-metric="5" onClickCapture={(e)=>onChartClickCapture(e, '5')} onMouseMove={(e)=>onChartMouseMove(e)} onMouseLeave={(e)=>onChartMouseLeave(e)} onClick={(e)=>onChartClick(e, '5')}>
                                        <div className="chart-preview-line" style={{display: (promisPlacingEvent) ? 'block' : 'none'}}></div>
                                        <Chart ref={c=>chartRefs.current['5']=c} options={{...piOptions.options, annotations: { xaxis: (promisEventsHidden ? [] : annotationsByMetric['5']) }}} series={piOptions.series} type="bar" height={400}></Chart>
                                    </div>
                                )
                            },
                            {
                                key: 'd',
                                label: <span className={`event-toggle ${promisPlacingEvent ? 'active' : ''}`}>Detail</span>,
                                children: <div style={{padding: 12, color: '#666'}}>{promisPlacingEvent ? 'Detail placement mode active — click on the chart to add details.' : 'Click Detail to enable placement mode.'}</div>
                            }
                        ]} />
                    </Col>
                </Row>
            </Card>
        </Content>
        );
    }

export default Athlete;
    