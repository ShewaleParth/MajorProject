import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: 'Mon', val: 400 },
  { name: 'Tue', val: 300 },
  { name: 'Wed', val: 550 },
  { name: 'Thu', val: 450 },
  { name: 'Fri', val: 700 }
];

export function DashboardPanel() {
  return (
    <div style={{ padding: "24px", height: "300px" }}>
      <h4 style={{ marginBottom: "16px", color: "var(--cyan)" }}>System Activity</h4>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="var(--muted)" />
          <YAxis stroke="var(--muted)" />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ backgroundColor: "var(--bg3)", borderColor: "var(--border)" }} />
          <Bar dataKey="val" fill="var(--cyan)" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InventoryPanel() {
  return (
    <div style={{ padding: "24px" }}>
      <h4 style={{ marginBottom: "16px", color: "var(--orange)" }}>Stock Levels</h4>
      <table style={{ width: "100%", textAlign: "left", fontSize: "0.95rem" }}>
        <thead>
          <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
            <th style={{ paddingBottom: "8px" }}>Item</th>
            <th style={{ paddingBottom: "8px" }}>SKU</th>
            <th style={{ paddingBottom: "8px" }}>Status</th>
            <th style={{ paddingBottom: "8px" }}>Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ paddingTop: "12px" }}>Industrial Motor</td><td style={{ paddingTop: "12px", color: "var(--muted)" }}>MT-21X</td><td style={{ paddingTop: "12px", color: "var(--green)" }}>Healthy</td><td style={{ paddingTop: "12px" }}>142</td></tr>
          <tr><td style={{ paddingTop: "12px" }}>Copper Coil</td><td style={{ paddingTop: "12px", color: "var(--muted)" }}>CC-09A</td><td style={{ paddingTop: "12px", color: "var(--orange)" }}>Low Stock</td><td style={{ paddingTop: "12px" }}>18</td></tr>
          <tr><td style={{ paddingTop: "12px" }}>Steel Bearing</td><td style={{ paddingTop: "12px", color: "var(--muted)" }}>SB-44B</td><td style={{ paddingTop: "12px", color: "var(--red)" }}>Critical</td><td style={{ paddingTop: "12px" }}>2</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export function SupplierPanel() {
  return (
    <div style={{ padding: "24px" }}>
      <h4 style={{ marginBottom: "16px", color: "var(--green)" }}>Recent Orders</h4>
      <table style={{ width: "100%", textAlign: "left", fontSize: "0.95rem" }}>
        <thead>
          <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
            <th style={{ paddingBottom: "8px" }}>Supplier</th>
            <th style={{ paddingBottom: "8px" }}>Rating</th>
            <th style={{ paddingBottom: "8px" }}>ETA</th>
            <th style={{ paddingBottom: "8px" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ paddingTop: "12px" }}>TechCorp</td><td style={{ paddingTop: "12px", color: "var(--amber)" }}>4.9★</td><td style={{ paddingTop: "12px", color: "var(--green)" }}>2 Days</td><td style={{ paddingTop: "12px" }}>$12K</td></tr>
          <tr><td style={{ paddingTop: "12px" }}>GlobalMetals</td><td style={{ paddingTop: "12px", color: "var(--amber)" }}>4.7★</td><td style={{ paddingTop: "12px", color: "var(--muted)" }}>5 Days</td><td style={{ paddingTop: "12px" }}>$45K</td></tr>
          <tr><td style={{ paddingTop: "12px" }}>FastFreight</td><td style={{ paddingTop: "12px", color: "var(--amber)" }}>4.5★</td><td style={{ paddingTop: "12px", color: "var(--red)" }}>Delayed</td><td style={{ paddingTop: "12px" }}>$8K</td></tr>
        </tbody>
      </table>
    </div>
  );
}
