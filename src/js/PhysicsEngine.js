import { min } from "three/tsl";

const G = 9.81;

export class PhysicsEngine {
    constructor(snapThreshold = 1.0) {
        this.snapThreshold = snapThreshold;
    }

    analyzeCluster(cluster) {
        if (!cluster || (cluster.size < 3)) { return null }

        const { nodes, bars } = this.extractNodesAndBars(cluster);

        this.identifySupports(nodes);
        this.applySelfWeight(nodes, bars);

        this.calculateGlobalReactions(nodes);

        return { nodes, bars };
    }

    extractNodesAndBars(cluster) {
        const nodes = [];
        const bars = [];

        let nodeIdCounter = 0;

        for (const stick of cluster) {
            const ends = stick.getEndPoints();
            const barNodes = [];

            for (const end of ends) {
                let foundNode = nodes.find((n) => 
                    Math.hypot(n.x - end.x, n.y - end.y) < this.snapThreshold
            );

                if (!foundNode) {
                    foundNode = {
                        id: nodeIdCounter++,
                        x: end.x,
                        y: end.y,
                        fx: 0,
                        fy: 0,
                        isSupport: false,
                        supportType: null,
                        connectedBars: []
                    };

                    nodes.push(foundNode);
                }

                barNodes.push(foundNode);
            }

            const newBar = {
                stick: stick,
                nodeA: barNodes[0],
                nodeB: barNodes[1],
                length: Math.hypot(barNodes[1].x - barNodes[0].x, barNodes[1].y - barNodes[0].y),
                force: null
            }

            bars.push(newBar);

            barNodes[0].connectedBars.push(newBar);
            barNodes[1].connectedBars.push(newBar);
        }

        return { nodes, bars };
    }

    identifySupports(nodes) {
        let minY = Infinity;

        for (const node of nodes) {
            if (node.y < minY) { minY = node.y }
        }

        const bottomNodes = nodes.filter(n => Math.abs(n.y - minY) < 0.1);

        bottomNodes.sort((a, b) => a.x - b.x);

        const leftSupport = bottomNodes[0];

        leftSupport.isSupport = true;
        leftSupport.supportType = "fixed";

        const rightSupport = bottomNodes[bottomNodes.length - 1];

        rightSupport.isSupport = true;
        rightSupport.supportType = "roller";
    }

    applySelfWeight(nodes, bars) {
        for (const bar of bars) {
            const halfWeight = bar.stick.get().scale.x * bar.stick.STICK_MASS * G / 2000.0;

            bar.nodeA.fy -= halfWeight;
            bar.nodeB.fy -= halfWeight;
        }
    }

    calculateGlobalReactions(nodes) {
        const supportA = nodes.find(n => n.supportType === "fixed");
        const supportB = nodes.find(n => n.supportType === "roller");

        if (!supportA || !supportB) { return }

        const distAB = supportB.x - supportA.x;

        let momentsA = 0;
        let totalYForce = 0;

        for (const node of nodes) {
            if (node.fy < 0) {
                const forceY = node.fy;

                momentsA += forceY * (node.x - supportA.x);
                totalYForce += forceY;
            }
        }

        const reactionBy = -momentsA / distAB;
        supportB.fy += reactionBy;

        const reactionAy = -totalYForce - reactionBy;
        supportA.fy += reactionAy;

        console.log("[REAÇÕES GLOBAIS")
        console.log(`Apoio (1º gênero) = ${reactionAy.toFixed(4)} N`)
        console.log(`Apoio (2º gênero) = ${reactionBy.toFixed(4)} N`)
    }
}