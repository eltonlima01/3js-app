import { Stick } from "./Stick";
import { Matrix, solve } from "ml-matrix";

const G = 9.81;

export class PhysicsEngine {
    constructor() {
        this.EA = 10000.0 * 2.0;
    }

    analyzeCluster(cluster) {
        if (!cluster || (cluster.size < 3)) { return null }

        const { nodes, bars } = this.extractNodesAndBars(cluster);

        this.identifySupports(nodes);
        this.applySelfWeight(nodes, bars);
        this.calculateInternalForces(nodes, bars);

        return { nodes, elements: bars };
    }

    extractNodesAndBars(cluster) {
        const nodes = [];
        const bars = [];

        let nodeIdCounter = 0;

        for (const stick of cluster) {
            const ends = stick.getEndPoints();
            const barNodes = [];

            for (const end of ends) {
                let foundNode = nodes.find((n) => Math.hypot(n.x - end.x, n.y - end.y) < Stick.SNAP_THRESHOLD);

                if (!foundNode) {
                    foundNode = {
                        id: nodeIdCounter++,
                        x: end.x,
                        y: end.y,
                        fx: 0,
                        fy: 0,
                        dispX: 0,
                        dispY: 0,
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

        for (const node of nodes) { minY = node.y < minY ? node.y : minY }

        const bottomNodes = nodes.filter(n => Math.abs(n.y - minY) < 0.1);
        bottomNodes.sort((a, b) => a.x - b.x);

        if (bottomNodes.length >= 2) {
            const leftSupport = bottomNodes[0];
            leftSupport.isSupport = true;
            leftSupport.supportType = "fixed";

            const rightSupport = bottomNodes[bottomNodes.length - 1];
            rightSupport.isSupport = true;
            rightSupport.supportType = "roller";
        }
        else if (bottomNodes.length >= 2) {
            const leftSupport = bottomNodes[0];
            leftSupport.isSupport = true;
            leftSupport.supportType = "fixed";
        }
    }

    applySelfWeight(nodes, bars) {
        for (const bar of bars) {
            const halfWeight = bar.stick.get().scale.x * Stick.DEFAULT_MASS * G / 1000.0;

            bar.nodeA.fy -= halfWeight;
            bar.nodeB.fy -= halfWeight;
        }
    }

    calculateInternalForces(nodes, bars) {
        const dim = nodes.length * 2;

        const K = Array.from ({ length: dim }, () => new Float64Array (dim) );
        const F = new Float64Array (dim);

        for (const node of nodes) {
            F[node.id * 2] = node.fx;
            F[(node.id * 2) + 1] = node.fy;
        }

        for (const bar of bars) {
            const barLength = bar.length;

            const dx = bar.nodeB.x - bar.nodeA.x;
            const dy = bar.nodeB.y - bar.nodeA.y;

            if (barLength < 0.001) { continue }

            const c = dx / barLength;
            const s = dy / barLength;

            const kAxial = this.EA / barLength;

            const cc = kAxial * c * c;
            const cs = kAxial * c * s;
            const ss = kAxial * s * s;

            const dofs = [
                bar.nodeA.id * 2,
                (bar.nodeA.id * 2) + 1,
                bar.nodeB.id * 2,
                (bar.nodeB.id * 2) + 1
            ];

            const kLocal = [
                [ cc, cs, -cc, -cs ],
                [ cs, ss, -cs, -ss ],
                [ -cc, -cs, cc, cs ],
                [ -cs, -ss, cs, ss ]
            ];

            for (let i = 0; i < 4; ++i) { for (let j = 0; j < 4; ++j) { K[dofs[i]][dofs[j]] += kLocal[i][j] } }
        }

        for (const node of nodes) {
            if (node.isSupport) {
                if (node.supportType === "fixed") {
                    const nodeId2 = node.id * 2;

                    this._restrainDOF (K, F, nodeId2);
                    this._restrainDOF (K, F, nodeId2 + 1);
                }
                else { this._restrainDOF (K, F, (node.id * 2) + 1) }
            }
        }

        let U;

        try { U = (solve(new Matrix (K), Matrix.columnVector(Array.from (F)))).to1DArray() }
        catch(error) { return }

        for (const node of nodes) {
            const nodeId2 = node.id * 2;

            node.dispX = U[nodeId2];
            node.dispY = U[nodeId2 + 1];
        }

        for (const bar of bars) {
            const barLength = bar.length;

            const dx = bar.nodeB.x - bar.nodeA.x;
            const dy = bar.nodeB.y - bar.nodeA.y;

            const c = dx / barLength;
            const s = dy / barLength;

            bar.force = ((this.EA / barLength) * ((c * (U[bar.nodeB.id * 2] - U[bar.nodeA.id * 2]))
            + s * (U[(bar.nodeB.id * 2) + 1] - U[(bar.nodeA.id * 2) + 1]))) / 2.0;

            bar.stick.force = bar.force;
        }
    }

    _restrainDOF(K, F, idx) {
        for (let i = 0; i < F.length; ++i) { K[idx][i] = 0.0 }

        K[idx][idx] = 1.0;
        F[idx] = 0.0;
    }
}