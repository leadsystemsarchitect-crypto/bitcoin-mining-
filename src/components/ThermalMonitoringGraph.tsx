import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Flame, 
  Thermometer, 
  Zap, 
  Activity, 
  Wind, 
  AlertTriangle, 
  RefreshCw, 
  Cpu, 
  Wrench,
  Layers,
  Gauge,
  Info
} from 'lucide-react';
import { GameState, HardwareItem } from '../types';

export interface ThermalMonitoringGraphProps {
  gameState: GameState;
  hardwareList: HardwareItem[];
  onRepairHardware?: (id: string) => void;
  onSetOverclock?: (level: number) => void;
}

export interface ThermalNode extends d3.SimulationNodeDatum {
  id: string;
  hardwareId: string;
  name: string;
  category: 'usb' | 'gpu' | 'fpga' | 'asic' | 'quantum' | 'hub';
  instanceIndex: number;
  temperature: number;
  baseTemp: number;
  health: number;
  power: number;
  hashRate: number;
  overclock: number;
  glowIntensity: number; // 0 to 1
  color: string;
  glowColor: string;
  radius: number;
  isHub?: boolean;
}

export interface ThermalLink extends d3.SimulationLinkDatum<ThermalNode> {
  source: string | ThermalNode;
  target: string | ThermalNode;
  proximityScore: number; // 0 to 1 based on thermal closeness
  distance: number;
}

export const ThermalMonitoringGraph: React.FC<ThermalMonitoringGraphProps> = ({
  gameState,
  hardwareList,
  onRepairHardware,
  onSetOverclock,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<ThermalNode, ThermalLink> | null>(null);

  const [selectedNode, setSelectedNode] = useState<ThermalNode | null>(null);
  const [coolantBoostActive, setCoolantBoostActive] = useState<boolean>(false);
  const [coolantCooldown, setCoolantCooldown] = useState<number>(0);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 680, height: 440 });
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Handle coolant boost countdown
  useEffect(() => {
    if (coolantCooldown > 0) {
      const timer = setTimeout(() => setCoolantCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (coolantBoostActive) {
      setCoolantBoostActive(false);
    }
  }, [coolantCooldown, coolantBoostActive]);

  const handleTriggerCoolant = () => {
    if (coolantCooldown > 0) return;
    setCoolantBoostActive(true);
    setCoolantCooldown(12); // 12 seconds cooldown
  };

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const calcWidth = Math.max(340, width);
        const calcHeight = Math.max(380, Math.min(520, calcWidth * 0.58));
        setDimensions({ width: calcWidth, height: calcHeight });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute thermal metrics
  const { nodesData, linksData, avgTemp, peakTemp, criticalCount } = useMemo(() => {
    const nodes: ThermalNode[] = [];
    const links: ThermalLink[] = [];

    // Central Heat Exchanger Hub node
    const hubNode: ThermalNode = {
      id: 'thermal_hub_core',
      hardwareId: 'hub',
      name: 'Exhaust Heat Manifold',
      category: 'hub',
      instanceIndex: 0,
      temperature: 36,
      baseTemp: 34,
      health: 100,
      power: 45,
      hashRate: 0,
      overclock: gameState.overclockLevel,
      glowIntensity: 0.25,
      color: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.4)',
      radius: 24,
      isHub: true,
      x: dimensions.width / 2,
      y: dimensions.height / 2,
    };
    nodes.push(hubNode);

    // Build nodes from owned hardware
    let unitGlobalIndex = 0;
    const activeHardware = hardwareList.filter((item) => (gameState.hardware[item.id] || 0) > 0);

    // Default beginner mock if no hardware owned yet
    const targetHardware = activeHardware.length > 0 ? activeHardware : [
      {
        id: 'usb_erupter',
        name: 'Block Erupter USB',
        category: 'usb' as const,
        hashRate: 2.5,
        powerConsumption: 5,
        cost: 50,
        costBtc: 0.0005,
        owned: 1,
        icon: 'Cpu',
        description: 'Starter test stick'
      }
    ];

    targetHardware.forEach((item) => {
      const ownedCount = Math.max(1, gameState.hardware[item.id] || (item.id === 'usb_erupter' ? 1 : 0));
      const health = gameState.hardwareHealth?.[item.id] ?? 100;
      
      // Determine max visual instances to prevent overcrowding (max 6 visual nodes per hardware model)
      const visualCount = Math.min(ownedCount, 6);

      // Base temp mapping by hardware archetype
      let baseCategoryTemp = 40;
      switch (item.category) {
        case 'usb': baseCategoryTemp = 41; break;
        case 'gpu': baseCategoryTemp = 63; break;
        case 'fpga': baseCategoryTemp = 58; break;
        case 'asic': baseCategoryTemp = 74; break;
        case 'quantum': baseCategoryTemp = 36; break;
      }

      for (let i = 0; i < visualCount; i++) {
        unitGlobalIndex++;
        const unitId = `${item.id}_${i}`;

        // Thermal math: base temp + overclock impact + degraded health thermal penalty
        const overclockMultiplier = Math.pow(gameState.overclockLevel, 1.22);
        const healthDegradationHeat = ((100 - health) / 100) * 22; // up to +22°C when failing
        const coolingOffset = coolantBoostActive ? -14 : 0;
        const jitter = (Math.sin(unitGlobalIndex * 1.7) * 1.8);

        const computedTemp = Math.max(
          32,
          Math.round((baseCategoryTemp * overclockMultiplier) + healthDegradationHeat + coolingOffset + jitter)
        );

        // Glow intensity & color interpolation based on heat
        // < 48°C: Emerald/Cyan (#10b981)
        // 48°C - 65°C: Yellow/Amber (#f59e0b)
        // 65°C - 80°C: Fiery Orange (#f97316)
        // >= 80°C: Critical Red/Magenta (#ef4444)
        let color = '#10b981';
        let glowColor = 'rgba(16, 185, 129, 0.45)';
        let glowIntensity = 0.35;
        let radius = 16;

        if (computedTemp < 50) {
          color = '#10b981'; // Cool Emerald
          glowColor = 'rgba(16, 185, 129, 0.45)';
          glowIntensity = 0.3 + (computedTemp / 100);
          radius = 16;
        } else if (computedTemp < 68) {
          color = '#f59e0b'; // Nominal Amber
          glowColor = 'rgba(245, 158, 11, 0.65)';
          glowIntensity = 0.55 + ((computedTemp - 50) / 40);
          radius = 18;
        } else if (computedTemp < 82) {
          color = '#f97316'; // Warm High Orange
          glowColor = 'rgba(249, 115, 22, 0.85)';
          glowIntensity = 0.75 + ((computedTemp - 68) / 30);
          radius = 21;
        } else {
          color = '#ef4444'; // Critical Core Overheat
          glowColor = 'rgba(239, 68, 68, 1.0)';
          glowIntensity = 1.0;
          radius = 24;
        }

        if (item.category === 'quantum') {
          radius = 26;
          if (computedTemp < 55) {
            color = '#38bdf8';
            glowColor = 'rgba(56, 189, 248, 0.8)';
          }
        }

        const node: ThermalNode = {
          id: unitId,
          hardwareId: item.id,
          name: visualCount > 1 ? `${item.name} #${i + 1}` : item.name,
          category: item.category,
          instanceIndex: i,
          temperature: computedTemp,
          baseTemp: baseCategoryTemp,
          health: Math.round(health),
          power: Math.round(item.powerConsumption * gameState.overclockLevel),
          hashRate: Math.round(item.hashRate * (health / 100) * gameState.overclockLevel),
          overclock: gameState.overclockLevel,
          glowIntensity,
          color,
          glowColor,
          radius,
        };

        nodes.push(node);

        // Connect to hub
        links.push({
          source: unitId,
          target: 'thermal_hub_core',
          proximityScore: Math.min(1, computedTemp / 100),
          distance: Math.max(65, 155 - (computedTemp * 0.7)),
        });
      }
    });

    // Create thermal proximity interconnects between hardware nodes
    const hwNodes = nodes.filter((n) => !n.isHub);
    for (let i = 0; i < hwNodes.length; i++) {
      for (let j = i + 1; j < hwNodes.length; j++) {
        const nodeA = hwNodes[i];
        const nodeB = hwNodes[j];

        // If they share category or have very similar temperatures (thermal coupling on rack)
        const tempDiff = Math.abs(nodeA.temperature - nodeB.temperature);
        const sameCategory = nodeA.category === nodeB.category;

        if (sameCategory || tempDiff < 9) {
          links.push({
            source: nodeA.id,
            target: nodeB.id,
            proximityScore: Math.max(0.15, 1 - (tempDiff / 30)),
            distance: Math.max(50, 70 + tempDiff * 2.5),
          });
        }
      }
    }

    const temps = hwNodes.map((n) => n.temperature);
    const avg = temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : 42;
    const peak = temps.length > 0 ? Math.max(...temps) : 42;
    const crit = hwNodes.filter((n) => n.temperature >= 80).length;

    return {
      nodesData: nodes,
      linksData: links,
      avgTemp: avg,
      peakTemp: peak,
      criticalCount: crit,
    };
  }, [gameState.hardware, gameState.hardwareHealth, gameState.overclockLevel, hardwareList, coolantBoostActive, dimensions]);

  // Keep selected node state synchronized with updated data
  useEffect(() => {
    if (selectedNode) {
      const fresh = nodesData.find((n) => n.id === selectedNode.id);
      if (fresh) setSelectedNode(fresh);
    }
  }, [nodesData]);

  // Setup D3 Force Directed Graph
  useEffect(() => {
    if (!svgRef.current) return;

    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup SVG Defs for Glowing Filters
    const defs = svg.append('defs');

    // Filter for normal/cool glow
    const filterCool = defs.append('filter')
      .attr('id', 'glow-cool')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filterCool.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const mergeCool = filterCool.append('feMerge');
    mergeCool.append('feMergeNode').attr('in', 'blur');
    mergeCool.append('feMergeNode').attr('in', 'SourceGraphic');

    // Filter for intense warm/hot glow
    const filterHot = defs.append('filter')
      .attr('id', 'glow-hot')
      .attr('x', '-60%')
      .attr('y', '-60%')
      .attr('width', '220%')
      .attr('height', '220%');
    filterHot.append('feGaussianBlur').attr('stdDeviation', '8').attr('result', 'blur');
    const mergeHot = filterHot.append('feMerge');
    mergeHot.append('feMergeNode').attr('in', 'blur');
    mergeHot.append('feMergeNode').attr('in', 'SourceGraphic');

    // Filter for critical glowing halo
    const filterCrit = defs.append('filter')
      .attr('id', 'glow-crit')
      .attr('x', '-80%')
      .attr('y', '-80%')
      .attr('width', '260%')
      .attr('height', '260%');
    filterCrit.append('feGaussianBlur').attr('stdDeviation', '12').attr('result', 'blur');
    const mergeCrit = filterCrit.append('feMerge');
    mergeCrit.append('feMergeNode').attr('in', 'blur');
    mergeCrit.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background radial grid for high-tech datacenter thermal chamber look
    const gridLayer = svg.append('g').attr('class', 'grid-layer');
    const rings = [60, 110, 160, 210, 260];
    rings.forEach((r) => {
      gridLayer.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#27272a')
        .attr('stroke-width', '1')
        .attr('stroke-dasharray', '3 4')
        .attr('opacity', '0.45');
    });

    // Crosshairs
    gridLayer.append('line')
      .attr('x1', width / 2).attr('y1', 15)
      .attr('x2', width / 2).attr('y2', height - 15)
      .attr('stroke', '#27272a')
      .attr('stroke-width', '1')
      .attr('stroke-dasharray', '2 4')
      .attr('opacity', '0.4');

    gridLayer.append('line')
      .attr('x1', 20).attr('y1', height / 2)
      .attr('x2', width - 20).attr('y2', height / 2)
      .attr('stroke', '#27272a')
      .attr('stroke-width', '1')
      .attr('stroke-dasharray', '2 4')
      .attr('opacity', '0.4');

    // Links container
    const linkLayer = svg.append('g').attr('class', 'link-layer');
    // Nodes container
    const nodeLayer = svg.append('g').attr('class', 'node-layer');

    // Deep clone data for D3 mutation
    const nodes: ThermalNode[] = nodesData.map((d) => ({ ...d }));
    const links: ThermalLink[] = linksData.map((d) => ({ ...d }));

    // Create D3 Force Simulation
    const simulation = d3.forceSimulation<ThermalNode, ThermalLink>(nodes)
      .force(
        'link',
        d3.forceLink<ThermalNode, ThermalLink>(links)
          .id((d) => d.id)
          .distance((d) => d.distance)
          .strength(0.35)
      )
      .force('charge', d3.forceManyBody<ThermalNode>().strength((d) => (d.isHub ? -340 : -160)))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<ThermalNode>().radius((d) => d.radius + 12).iterations(2));

    simulationRef.current = simulation;

    // Render Links (Thermal proximity conduction lines)
    const linkElements = linkLayer.selectAll<SVGLineElement, ThermalLink>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        const score = d.proximityScore || 0.5;
        if (score > 0.8) return '#f97316';
        if (score > 0.6) return '#eab308';
        return '#3f3f46';
      })
      .attr('stroke-opacity', (d) => Math.max(0.18, d.proximityScore * 0.45))
      .attr('stroke-width', (d) => Math.max(1, d.proximityScore * 2.5))
      .attr('stroke-dasharray', (d) => (d.proximityScore > 0.7 ? 'none' : '4 3'));

    // Render Nodes (Hardware units)
    const nodeGroups = nodeLayer.selectAll<SVGGElement, ThermalNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'cursor-pointer')
      .call(
        d3.drag<SVGGElement, ThermalNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (_, d) => {
        setSelectedNode(d);
      });

    // Outer pulsating thermal glow halo for hot/overclocked units
    nodeGroups.each(function (d) {
      const g = d3.select(this);

      // Outer thermal aura ring
      g.append('circle')
        .attr('r', d.radius + (d.glowIntensity * 12))
        .attr('fill', d.glowColor)
        .attr('opacity', d.glowIntensity * 0.6)
        .attr('filter', d.temperature >= 80 ? 'url(#glow-crit)' : d.temperature >= 65 ? 'url(#glow-hot)' : 'url(#glow-cool)');

      // Secondary glowing border ring
      g.append('circle')
        .attr('r', d.radius + 3)
        .attr('fill', 'none')
        .attr('stroke', d.color)
        .attr('stroke-width', d.temperature >= 80 ? 2 : 1.2)
        .attr('stroke-opacity', 0.9)
        .attr('stroke-dasharray', d.health < 60 ? '3 2' : 'none');

      // Core Hardware Disc
      g.append('circle')
        .attr('r', d.radius)
        .attr('fill', d.isHub ? '#18181b' : '#09090b')
        .attr('stroke', d.color)
        .attr('stroke-width', 2);

      // Inner heat core icon or dot
      if (d.isHub) {
        g.append('circle')
          .attr('r', 6)
          .attr('fill', '#06b6d4')
          .attr('opacity', 0.85);
      } else {
        // Temperature text inside the node
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', '#ffffff')
          .attr('font-family', 'Space Mono, monospace')
          .attr('font-size', d.radius >= 22 ? '10px' : '9px')
          .attr('font-weight', '700')
          .text(`${d.temperature}°`);
      }

      // Hardware label below node
      g.append('text')
        .attr('y', d.radius + 13)
        .attr('text-anchor', 'middle')
        .attr('fill', d.isHub ? '#a1a1aa' : '#d4d4d8')
        .attr('font-family', 'system-ui, sans-serif')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(d.isHub ? 'Hub' : d.name.length > 14 ? d.name.substring(0, 12) + '…' : d.name);
    });

    // Update positions on every simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as ThermalNode).x || 0)
        .attr('y1', (d) => (d.source as ThermalNode).y || 0)
        .attr('x2', (d) => (d.target as ThermalNode).x || 0)
        .attr('y2', (d) => (d.target as ThermalNode).y || 0);

      nodeGroups.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodesData, linksData, dimensions]);

  // Restart / reheat simulation
  const handleReheatSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.8).restart();
    }
  };

  const handleOverclockChange = (lvl: number) => {
    if (onSetOverclock) {
      onSetOverclock(lvl);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Thermal Proximity Monitoring
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                D3 Force Graph
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Interactive node mesh showing thermal conduction, overclock heat radiation, and unit degradation.
            </p>
          </div>
        </div>

        {/* Global Thermal Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px]">AVG</span>
            <span className={`font-bold ${avgTemp > 75 ? 'text-rose-400' : avgTemp > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {avgTemp}°C
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px]">PEAK</span>
            <span className={`font-bold ${peakTemp > 80 ? 'text-rose-400 animate-pulse' : 'text-orange-400'}`}>
              {peakTemp}°C
            </span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse font-bold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              {criticalCount} Hot Core{criticalCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Main Graph Stage & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* D3 Canvas Container (Left / Center) */}
        <div 
          ref={containerRef} 
          className="lg:col-span-8 relative bg-zinc-950/90 border border-zinc-800/80 rounded-xl overflow-hidden min-h-[380px] flex items-center justify-center select-none"
        >
          {/* Top-right overlay controls */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <button
              onClick={handleTriggerCoolant}
              disabled={coolantCooldown > 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                coolantBoostActive
                  ? 'bg-cyan-500 text-zinc-950 border-cyan-400 animate-pulse font-mono'
                  : coolantCooldown > 0
                  ? 'bg-zinc-800/80 text-zinc-500 border-zinc-700 cursor-not-allowed font-mono'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
              }`}
              title="Inject Liquid Coolant burst to lower hardware junction temperature"
            >
              <Wind className="w-3.5 h-3.5" />
              {coolantBoostActive 
                ? 'Cooling Active!' 
                : coolantCooldown > 0 
                ? `Purge (${coolantCooldown}s)` 
                : 'Coolant Purge'}
            </button>

            <button
              onClick={handleReheatSimulation}
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
              title="Re-balance force simulation physics"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* D3 SVG Element */}
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full block"
          />

          {/* Thermal Scale Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/85 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-zinc-400">
            <span className="text-zinc-500">HEAT:</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              &lt;50°C
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              65°C
            </span>
            <span className="flex items-center gap-1 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
              80°C
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block"></span>
              90°C+
            </span>
          </div>

          {/* Interaction hint */}
          <div className="absolute top-3 left-3 text-[10px] text-zinc-500 font-mono flex items-center gap-1 pointer-events-none">
            <Activity className="w-3 h-3 text-zinc-400" />
            <span>Drag nodes • Click for unit telemetry</span>
          </div>
        </div>

        {/* Right Info & Telemetry Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          {/* Node Inspector Card */}
          {selectedNode && !selectedNode.isHub ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3.5 shadow-md flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {selectedNode.category.toUpperCase()} UNIT
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{selectedNode.name}</h4>
                </div>
                <div 
                  className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold border"
                  style={{ 
                    color: selectedNode.color,
                    borderColor: selectedNode.color + '40',
                    backgroundColor: selectedNode.color + '15'
                  }}
                >
                  {selectedNode.temperature}°C / {Math.round(selectedNode.temperature * 1.8 + 32)}°F
                </div>
              </div>

              {/* Progress bars: Health & Thermal Stress */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Hardware Health:</span>
                    <span className={`font-mono font-bold ${
                      selectedNode.health > 70 ? 'text-emerald-400' : selectedNode.health > 40 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {selectedNode.health}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        selectedNode.health > 70 ? 'bg-emerald-400' : selectedNode.health > 40 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${selectedNode.health}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2">
                    <span className="text-zinc-500 block text-[9px]">POWER DRAW</span>
                    <span className="text-amber-400 font-bold">{selectedNode.power} W</span>
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2">
                    <span className="text-zinc-500 block text-[9px]">EFFECTIVE HASH</span>
                    <span className="text-emerald-400 font-bold">{selectedNode.hashRate.toLocaleString()} GH/s</span>
                  </div>
                </div>
              </div>

              {/* Quick Action: Repair unit if degraded */}
              {onRepairHardware && selectedNode.health < 100 && (
                <button
                  onClick={() => onRepairHardware(selectedNode.hardwareId)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Service & Recalibrate Core
                </button>
              )}

              {selectedNode.temperature >= 80 && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Thermal Throttling Alert:</strong> High temperature is accelerating hardware wear by {(selectedNode.overclock * 1.5).toFixed(1)}x.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 flex-1 flex flex-col justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <Thermometer className="w-5 h-5 text-orange-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Unit Telemetry Inspector</h4>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                  Click on any hardware node in the thermal force graph to inspect junction heat, thermal resistance, and health dissipation.
                </p>
              </div>
            </div>
          )}

          {/* Overclock Quick Tuner */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                Overclock Frequency
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {gameState.overclockLevel.toFixed(1)}x
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[1.0, 1.5, 2.0, 2.5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleOverclockChange(lvl)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    gameState.overclockLevel === lvl
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500">
              Higher overclock spikes thermal radiation across all units, increasing temperature and glow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
