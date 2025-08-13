import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DocFile {
  name: string;
  title: string;
  description: string;
  category: string;
  lastModified: Date;
  icon: string;
}

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnInit {
  searchTerm = '';
  selectedCategory = 'all';
  selectedDocument: DocFile | null = null;
  documentContent = '';
  isLoading = false;
  error: string | null = null;

  categories = ['all', 'pricing', 'regulations', 'technical', 'market', 'other'];

  documents: DocFile[] = [
    {
      name: 'SAF_PRICING_STRATEGY.md',
      title: 'SAF Pricing Strategy Guide',
      description: 'Comprehensive guide to pricing sustainable aviation fuel certificates based on market conditions, production costs, and demand forecasting.',
      category: 'pricing',
      lastModified: new Date('2024-01-15'),
      icon: '💰'
    },
    {
      name: 'SAF_CERTIFICATE_REGULATIONS.md',
      title: 'Certificate Regulations & Compliance',
      description: 'Detailed regulatory framework for SAF certificate issuance, trading, and compliance with international aviation standards.',
      category: 'regulations',
      lastModified: new Date('2024-01-10'),
      icon: '📋'
    },
    {
      name: 'PRODUCTION_PRICING_GUIDE.md',
      title: 'Production Cost Analysis',
      description: 'In-depth analysis of SAF production costs, including feedstock pricing, refining processes, and cost optimization strategies.',
      category: 'technical',
      lastModified: new Date('2024-01-08'),
      icon: '🏭'
    },
    {
      name: 'MARKET_TRENDS_2024.md',
      title: 'Market Trends & Forecasting',
      description: 'Latest market trends in sustainable aviation fuel demand, supply chain analysis, and price forecasting for 2024.',
      category: 'pricing',
      lastModified: new Date('2024-01-12'),
      icon: '📈'
    },
    {
      name: 'CARBON_CREDIT_INTEGRATION.md',
      title: 'Carbon Credit Integration',
      description: 'Guide to integrating carbon credits with SAF certificates for enhanced environmental impact and value proposition.',
      category: 'technical',
      lastModified: new Date('2024-01-05'),
      icon: '🌱'
    },
    {
      name: 'QUALITY_STANDARDS.md',
      title: 'Quality Standards & Testing',
      description: 'Comprehensive standards for SAF quality testing, certification processes, and quality assurance protocols.',
      category: 'technical',
      lastModified: new Date('2024-01-14'),
      icon: '🔬'
    },
    {
      name: 'MARKET_ANALYSIS_COMPETITIVE_POSITIONING.md',
      title: 'Market Analysis & Competitive Positioning',
      description: 'Comprehensive analysis of current market players, competitive landscape, and how our platform addresses existing gaps in the SAF certificate trading ecosystem.',
      category: 'market',
      lastModified: new Date('2025-08-11'),
      icon: '🎯'
    }
  ];

  filteredDocuments: DocFile[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.isLoading = true;
    this.error = null;

    // Simulate loading time
    setTimeout(() => {
      this.filteredDocuments = this.documents;
      this.filterDocuments();
      this.isLoading = false;
    }, 1000);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterDocuments();
  }

  onSearch() {
    this.filterDocuments();
  }

  filterDocuments() {
    let filtered = this.documents;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === this.selectedCategory);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.category.toLowerCase().includes(term)
      );
    }

    this.filteredDocuments = filtered;
  }

  openDocument(doc: DocFile) {
    this.selectedDocument = doc;
    this.loadDocumentContent(doc);
  }

  loadDocumentContent(doc: DocFile) {
    this.documentContent = '';

    // Mock content based on document type
    setTimeout(() => {
      this.documentContent = this.getMockContent(doc);
    }, 500);
  }

  getMockContent(doc: DocFile): string {
    switch (doc.name) {
      case 'SAF_PRICING_STRATEGY.md':
        return `
          <h1>SAF Certificate Pricing Strategy</h1>

          <h2>Executive Summary</h2>
          <p>This document outlines the real-time pricing strategy for the EcoJet Certificates platform, designed for professional deployment with legitimate market data sources and dynamic pricing algorithms.</p>

          <h2>Market Data Sources</h2>

          <h3>Tier 1: Professional Commodity Pricing APIs</h3>

          <h4>1. OPIS (Oil Price Information Service)</h4>
          <ul>
            <li><strong>Cost:</strong> $2,000-5,000/month</li>
            <li><strong>Coverage:</strong> Industry standard for fuel pricing</li>
            <li><strong>API:</strong> https://api.opisnet.com/v2/pricing/saf</li>
            <li><strong>Reliability:</strong> 99.9% uptime</li>
            <li><strong>Update Frequency:</strong> Real-time</li>
            <li><strong>Best For:</strong> Primary SAF pricing source</li>
          </ul>

          <h4>2. Platts (S&P Global)</h4>
          <ul>
            <li><strong>Cost:</strong> $1,500-3,000/month</li>
            <li><strong>Coverage:</strong> Global commodities leader</li>
            <li><strong>API:</strong> https://api.platts.com/v1/commodities/saf</li>
            <li><strong>Reliability:</strong> 99.8% uptime</li>
            <li><strong>Update Frequency:</strong> Multiple times daily</li>
            <li><strong>Best For:</strong> Secondary pricing validation</li>
          </ul>

          <h3>Tier 2: Carbon Market Integration</h3>

          <h4>EU ETS Carbon Pricing</h4>
          <ul>
            <li><strong>Cost:</strong> Free basic tier, $500/month professional</li>
            <li><strong>Coverage:</strong> EU carbon credits pricing</li>
            <li><strong>API:</strong> https://api.carbontracker.org/v1/carbon-prices/eu-ets</li>
            <li><strong>Update Frequency:</strong> Daily</li>
            <li><strong>Best For:</strong> Carbon credit component pricing</li>
          </ul>

          <h2>Pricing Architecture</h2>

          <h3>Fallback Strategy</h3>
          <ol>
            <li>OPIS SAF Pricing (Primary)</li>
            <li>Platts Commodity Pricing (Secondary)</li>
            <li>ICIS Renewable Fuels Data (Tertiary)</li>
            <li>Manual Override with market alerts</li>
          </ol>

          <h3>Dynamic Pricing Formula</h3>
          <p><code>Final Price = Base SAF Price + Carbon Credit Value + Certification Premium + Market Volatility Adjustment</code></p>

          <h4>Components Breakdown:</h4>
          <ul>
            <li><strong>Base SAF Price:</strong> Current market rate from primary data source</li>
            <li><strong>Carbon Credit Value:</strong> EU ETS or voluntary carbon market pricing</li>
            <li><strong>Certification Premium:</strong> 5-15% premium for verified sustainability</li>
            <li><strong>Market Volatility:</strong> ±3-8% based on 30-day volatility index</li>
          </ul>

          <h2>Risk Management</h2>
          <ul>
            <li><strong>Price Hedging:</strong> Forward contracts for 60% of expected volume</li>
            <li><strong>Currency Risk:</strong> Multi-currency pricing with real-time conversion</li>
            <li><strong>Credit Risk:</strong> Buyer verification and payment guarantees</li>
            <li><strong>Regulatory Risk:</strong> Monitoring policy changes across jurisdictions</li>
          </ul>
        `;

      case 'SAF_CERTIFICATE_REGULATIONS.md':
        return `
          <h1>SAF Certificate Regulations & Verification Guide</h1>

          <h2>Executive Summary</h2>
          <p>Sustainable Aviation Fuel (SAF) certificates are regulated financial instruments that verify the purchase and use of sustainable aviation fuel for carbon emission offsetting. This document outlines the legal framework, verification processes, and compliance requirements.</p>

          <h2>Regulatory Framework</h2>

          <h3>International Standards</h3>

          <h4>1. ICAO (International Civil Aviation Organization)</h4>
          <ul>
            <li><strong>CORSIA:</strong> Carbon Offsetting and Reduction Scheme for International Aviation</li>
            <li><strong>Annex 16, Volume IV:</strong> Environmental standards for aviation</li>
            <li><strong>ICAO Document 9501:</strong> Environmental Technical Manual</li>
            <li><strong>Requirements:</strong> All international flights must offset carbon emissions through approved mechanisms</li>
          </ul>

          <h4>2. EU Regulations</h4>
          <ul>
            <li><strong>EU ETS:</strong> Aviation included since 2012</li>
            <li><strong>RED II:</strong> Sustainability criteria for biofuels</li>
            <li><strong>ReFuelEU Aviation:</strong> Mandate for SAF blending quotas (2% by 2025, 5% by 2030)</li>
            <li><strong>Fit for 55 Package:</strong> 55% emissions reduction by 2030</li>
          </ul>

          <h4>3. US Federal Aviation Administration (FAA)</h4>
          <ul>
            <li><strong>ASTM D7566:</strong> Standard specification for aviation turbine fuel containing synthesized hydrocarbons</li>
            <li><strong>EPA Renewable Fuel Standard (RFS):</strong> Renewable fuel volume mandates</li>
            <li><strong>CORSIA Eligible Fuels (CEF):</strong> Database of approved sustainable fuels</li>
          </ul>

          <h2>Certificate Verification Process</h2>

          <h3>1. Chain of Custody Verification</h3>
          <h4>Feedstock Origin</h4>
          <ul>
            <li><strong>Certification:</strong> RSB (Roundtable on Sustainable Biomaterials)</li>
            <li><strong>Verification:</strong> Third-party auditing of feedstock sources</li>
            <li><strong>Documentation:</strong> Complete supply chain tracking</li>
          </ul>

          <h3>2. Production Process Verification</h3>
          <ul>
            <li><strong>Facility Inspection:</strong> Annual on-site audits</li>
            <li><strong>Quality Testing:</strong> ASTM D7566 compliance verification</li>
            <li><strong>Emissions Calculation:</strong> Lifecycle assessment (LCA) validation</li>
          </ul>

          <h3>3. Certificate Lifecycle</h3>
          <ol>
            <li><strong>Issuance:</strong> Upon fuel production and verification</li>
            <li><strong>Registry:</strong> Digital registration in blockchain-based system</li>
            <li><strong>Trading:</strong> Transparent marketplace transactions</li>
            <li><strong>Retirement:</strong> Final use for emissions offsetting</li>
          </ol>

          <h2>Compliance Requirements</h2>
          <ul>
            <li><strong>Reporting:</strong> Quarterly emissions and SAF usage reports</li>
            <li><strong>Auditing:</strong> Annual third-party verification</li>
            <li><strong>Record Keeping:</strong> 7-year documentation retention</li>
            <li><strong>Transparency:</strong> Public disclosure of sustainability metrics</li>
          </ul>
        `;

      case 'PRODUCTION_PRICING_GUIDE.md':
        return `
          <h1>SAF Production Cost Analysis</h1>

          <h2>Executive Summary</h2>
          <p>This comprehensive analysis examines the cost structure of sustainable aviation fuel production across different pathways, providing data-driven insights for pricing strategies and investment decisions.</p>

          <h2>Production Pathways & Costs</h2>

          <h3>1. HEFA (Hydroprocessed Esters and Fatty Acids)</h3>
          <h4>Cost Breakdown (per gallon):</h4>
          <ul>
            <li><strong>Feedstock (60-70%):</strong> $2.40 - $4.20</li>
            <li><strong>Processing (20-25%):</strong> $0.80 - $1.50</li>
            <li><strong>Capital Recovery (10-15%):</strong> $0.40 - $0.90</li>
            <li><strong>Total Production Cost:</strong> $3.60 - $6.60/gallon</li>
          </ul>

          <h4>Feedstock Sources & Pricing:</h4>
          <ul>
            <li><strong>Used Cooking Oil:</strong> $0.40-0.80/lb ($2.80-5.60/gallon equivalent)</li>
            <li><strong>Soybean Oil:</strong> $0.60-1.20/lb ($4.20-8.40/gallon equivalent)</li>
            <li><strong>Animal Fats:</strong> $0.30-0.60/lb ($2.10-4.20/gallon equivalent)</li>
            <li><strong>Camelina Oil:</strong> $0.80-1.40/lb ($5.60-9.80/gallon equivalent)</li>
          </ul>

          <h3>2. FT-SPK (Fischer-Tropsch Synthetic Paraffinic Kerosene)</h3>
          <h4>Cost Breakdown (per gallon):</h4>
          <ul>
            <li><strong>Biomass Feedstock (40-50%):</strong> $1.60 - $3.00</li>
            <li><strong>Gasification & Processing (35-45%):</strong> $1.40 - $2.70</li>
            <li><strong>Capital Recovery (15-20%):</strong> $0.60 - $1.20</li>
            <li><strong>Total Production Cost:</strong> $3.60 - $6.90/gallon</li>
          </ul>

          <h3>3. ATJ (Alcohol-to-Jet)</h3>
          <h4>Cost Breakdown (per gallon):</h4>
          <ul>
            <li><strong>Ethanol/Alcohol (50-60%):</strong> $2.00 - $3.60</li>
            <li><strong>Conversion Processing (25-35%):</strong> $1.00 - $2.10</li>
            <li><strong>Capital & Operations (15-20%):</strong> $0.60 - $1.20</li>
            <li><strong>Total Production Cost:</strong> $3.60 - $6.90/gallon</li>
          </ul>

          <h2>Scale Economics</h2>

          <h3>Production Capacity Impact</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Capacity (Million Gallons/Year)</th>
              <th>Capital Cost ($/Gallon Capacity)</th>
              <th>Unit Production Cost</th>
            </tr>
            <tr>
              <td>10-50</td>
              <td>$15-25</td>
              <td>$5.50-8.00/gallon</td>
            </tr>
            <tr>
              <td>50-150</td>
              <td>$10-18</td>
              <td>$4.50-6.50/gallon</td>
            </tr>
            <tr>
              <td>150-500</td>
              <td>$8-14</td>
              <td>$3.50-5.50/gallon</td>
            </tr>
            <tr>
              <td>500+</td>
              <td>$6-12</td>
              <td>$3.00-4.50/gallon</td>
            </tr>
          </table>

          <h2>Cost Optimization Strategies</h2>

          <h3>Feedstock Optimization</h3>
          <ul>
            <li><strong>Diversified Sourcing:</strong> Multiple feedstock types to reduce price volatility</li>
            <li><strong>Long-term Contracts:</strong> 3-5 year agreements with price caps</li>
            <li><strong>Geographic Proximity:</strong> Feedstock within 50-mile radius to minimize transport</li>
            <li><strong>Waste Stream Integration:</strong> Municipal and industrial waste partnerships</li>
          </ul>

          <h3>Process Efficiency</h3>
          <ul>
            <li><strong>Heat Integration:</strong> Recovery of process heat can reduce costs by 10-15%</li>
            <li><strong>Catalyst Optimization:</strong> Advanced catalysts extend life and improve yields</li>
            <li><strong>Automation:</strong> Reduced labor costs through process automation</li>
            <li><strong>Co-product Revenue:</strong> Valorization of biochar, naphtha, and diesel co-products</li>
          </ul>

          <h2>Market Price Benchmarking</h2>
          <p><strong>Current SAF Market Prices (2024):</strong></p>
          <ul>
            <li><strong>Spot Market:</strong> $4.50-7.50/gallon</li>
            <li><strong>Long-term Contracts:</strong> $4.00-6.50/gallon</li>
            <li><strong>Premium Certified:</strong> $5.50-8.50/gallon</li>
            <li><strong>Conventional Jet Fuel:</strong> $2.80-4.20/gallon</li>
          </ul>
        `;

      case 'MARKET_TRENDS_2024.md':
        return `
          <h1>SAF Market Trends & Forecasting 2024</h1>

          <h2>Market Overview</h2>
          <p>The global sustainable aviation fuel market is experiencing unprecedented growth, driven by regulatory mandates, corporate sustainability commitments, and technological advances in production efficiency.</p>

          <h2>Global Production Capacity</h2>

          <h3>Current Capacity (2024)</h3>
          <ul>
            <li><strong>Global SAF Production:</strong> 1.2 billion gallons/year</li>
            <li><strong>Announced Projects:</strong> Additional 8.5 billion gallons by 2030</li>
            <li><strong>Investment Pipeline:</strong> $45 billion in committed capital</li>
            <li><strong>Geographic Distribution:</strong> 60% North America, 25% Europe, 15% Asia-Pacific</li>
          </ul>

          <h3>Regional Capacity Breakdown</h3>
          <h4>North America</h4>
          <ul>
            <li><strong>United States:</strong> 720 million gallons (operating + under construction)</li>
            <li><strong>Canada:</strong> 180 million gallons planned capacity</li>
            <li><strong>Key Players:</strong> Neste, Diamond Green Diesel, Renewable Jet Fuel LLC</li>
          </ul>

          <h4>Europe</h4>
          <ul>
            <li><strong>Netherlands:</strong> 200 million gallons (Neste Rotterdam)</li>
            <li><strong>Finland:</strong> 180 million gallons (Neste Porvoo)</li>
            <li><strong>France:</strong> 150 million gallons (TotalEnergies La Mède)</li>
            <li><strong>Emerging Markets:</strong> Norway, Sweden, UK with 50-100 million gallons each</li>
          </ul>

          <h2>Demand Projections</h2>

          <h3>Airline Commitments</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Airline</th>
              <th>SAF Target</th>
              <th>Timeline</th>
              <th>Annual Volume (Gallons)</th>
            </tr>
            <tr>
              <td>United Airlines</td>
              <td>Net Zero by 2050</td>
              <td>2030: 200M gal/year</td>
              <td>200,000,000</td>
            </tr>
            <tr>
              <td>Delta Air Lines</td>
              <td>10% SAF by 2030</td>
              <td>2030: 400M gal/year</td>
              <td>400,000,000</td>
            </tr>
            <tr>
              <td>American Airlines</td>
              <td>Net Zero by 2050</td>
              <td>2030: 300M gal/year</td>
              <td>300,000,000</td>
            </tr>
            <tr>
              <td>Lufthansa Group</td>
              <td>5% SAF by 2030</td>
              <td>2030: 150M gal/year</td>
              <td>150,000,000</td>
            </tr>
          </table>

          <h2>Price Trends & Forecasting</h2>

          <h3>Historical Price Evolution</h3>
          <ul>
            <li><strong>2020:</strong> $6.50-12.00/gallon (limited production)</li>
            <li><strong>2021:</strong> $5.50-9.50/gallon (increased capacity)</li>
            <li><strong>2022:</strong> $4.80-8.20/gallon (scale economies)</li>
            <li><strong>2023:</strong> $4.50-7.50/gallon (market maturation)</li>
            <li><strong>2024:</strong> $4.20-7.00/gallon (competitive market)</li>
          </ul>

          <h3>Price Forecast (2025-2030)</h3>
          <ul>
            <li><strong>2025:</strong> $3.80-6.20/gallon</li>
            <li><strong>2026:</strong> $3.50-5.80/gallon</li>
            <li><strong>2027:</strong> $3.20-5.40/gallon</li>
            <li><strong>2028:</strong> $3.00-5.00/gallon</li>
            <li><strong>2029:</strong> $2.80-4.60/gallon</li>
            <li><strong>2030:</strong> $2.60-4.20/gallon</li>
          </ul>

          <h2>Supply Chain Analysis</h2>

          <h3>Feedstock Availability</h3>
          <ul>
            <li><strong>Used Cooking Oil:</strong> 2.5 billion gallons/year global availability</li>
            <li><strong>Animal Fats:</strong> 1.8 billion gallons/year potential</li>
            <li><strong>Energy Crops:</strong> 15+ billion gallons/year theoretical capacity</li>
            <li><strong>Municipal Waste:</strong> 5+ billion gallons/year conversion potential</li>
          </ul>

          <h3>Technology Readiness</h3>
          <ul>
            <li><strong>HEFA Pathway:</strong> Commercial scale, proven technology</li>
            <li><strong>Fischer-Tropsch:</strong> Demonstration scale, moving to commercial</li>
            <li><strong>Alcohol-to-Jet:</strong> Early commercial deployments</li>
            <li><strong>Power-to-Liquids:</strong> Pilot scale, high potential for 2030+</li>
          </ul>

          <h2>Regulatory Impact</h2>

          <h3>Blending Mandates Timeline</h3>
          <ul>
            <li><strong>EU ReFuelEU:</strong> 2% (2025), 5% (2030), 32% (2040), 63% (2050)</li>
            <li><strong>UK Mandate:</strong> 2% (2025), 10% (2030)</li>
            <li><strong>US Federal:</strong> Voluntary targets, state-level mandates emerging</li>
            <li><strong>CORSIA:</strong> Global offsetting requirements for international flights</li>
          </ul>

          <h2>Investment Outlook</h2>
          <p><strong>Capital Requirements (2024-2030):</strong></p>
          <ul>
            <li><strong>Production Facilities:</strong> $35-50 billion</li>
            <li><strong>Feedstock Infrastructure:</strong> $8-12 billion</li>
            <li><strong>Distribution & Storage:</strong> $5-8 billion</li>
            <li><strong>R&D & Technology:</strong> $3-5 billion</li>
            <li><strong>Total Investment Need:</strong> $51-75 billion</li>
          </ul>
        `;

      case 'CARBON_CREDIT_INTEGRATION.md':
        return `
          <h1>Carbon Credit Integration with SAF Certificates</h1>

          <h2>Executive Summary</h2>
          <p>This guide outlines the integration of carbon credits with SAF certificates to maximize environmental impact and create additional revenue streams for sustainable aviation fuel producers and users.</p>

          <h2>Carbon Credit Mechanisms</h2>

          <h3>Voluntary Carbon Markets (VCM)</h3>
          <h4>Standards & Methodologies</h4>
          <ul>
            <li><strong>Verra VCS (Verified Carbon Standard):</strong> Most widely used standard</li>
            <li><strong>Gold Standard:</strong> Focus on sustainable development co-benefits</li>
            <li><strong>Climate Action Reserve (CAR):</strong> North American focus</li>
            <li><strong>American Carbon Registry (ACR):</strong> US-based registry</li>
          </ul>

          <h4>SAF-Specific Methodologies</h4>
          <ul>
            <li><strong>VM0047:</strong> Methodology for Sustainable Aviation Fuel Projects</li>
            <li><strong>Baseline:</strong> Conventional jet fuel emissions</li>
            <li><strong>Quantification:</strong> Lifecycle assessment approach</li>
            <li><strong>Monitoring:</strong> Continuous fuel production and emissions tracking</li>
          </ul>

          <h3>Compliance Markets</h3>
          <h4>CORSIA (Carbon Offsetting and Reduction Scheme for International Aviation)</h4>
          <ul>
            <li><strong>Scope:</strong> International flights between participating countries</li>
            <li><strong>Baseline:</strong> 2019-2020 average emissions</li>
            <li><strong>Offset Requirement:</strong> Growth above baseline must be offset</li>
            <li><strong>SAF Treatment:</strong> Direct use reduces CORSIA offsetting obligation</li>
          </ul>

          <h2>Integration Models</h2>

          <h3>Model 1: Bundled SAF + Carbon Credits</h3>
          <h4>Structure</h4>
          <ul>
            <li><strong>Product:</strong> SAF certificate + verified carbon credits</li>
            <li><strong>Pricing:</strong> Premium pricing for complete carbon neutrality</li>
            <li><strong>Verification:</strong> Dual certification required</li>
            <li><strong>Use Case:</strong> Corporate buyers seeking comprehensive carbon solutions</li>
          </ul>

          <h4>Revenue Distribution</h4>
          <ul>
            <li><strong>SAF Component:</strong> 70-80% of total price</li>
            <li><strong>Carbon Credit Component:</strong> 20-30% of total price</li>
            <li><strong>Premium:</strong> 15-25% above separate purchases</li>
          </ul>

          <h3>Model 2: SAF-Derived Carbon Credits</h3>
          <h4>Generation Process</h4>
          <ul>
            <li><strong>Baseline Calculation:</strong> Conventional jet fuel lifecycle emissions</li>
            <li><strong>SAF Emissions:</strong> Actual SAF lifecycle emissions</li>
            <li><strong>Credit Quantity:</strong> Difference in CO2 emissions per gallon</li>
            <li><strong>Verification:</strong> Third-party auditing of emissions calculations</li>
          </ul>

          <h4>Credit Pricing</h4>
          <ul>
            <li><strong>High-Quality Credits:</strong> $15-35/tCO2e</li>
            <li><strong>CORSIA-Eligible:</strong> $25-45/tCO2e</li>
            <li><strong>Gold Standard/Verra:</strong> $20-40/tCO2e</li>
            <li><strong>Regional Variations:</strong> EU premiums of 20-40%</li>
          </ul>

          <h2>Lifecycle Emissions Analysis</h2>

          <h3>Conventional Jet Fuel</h3>
          <ul>
            <li><strong>Total Emissions:</strong> 89.1 gCO2e/MJ</li>
            <li><strong>Production & Refining:</strong> 15.8 gCO2e/MJ</li>
            <li><strong>Combustion:</strong> 73.3 gCO2e/MJ</li>
          </ul>

          <h3>SAF Pathways</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Pathway</th>
              <th>Feedstock</th>
              <th>Total Emissions (gCO2e/MJ)</th>
              <th>Reduction vs Conventional</th>
            </tr>
            <tr>
              <td>HEFA</td>
              <td>Used Cooking Oil</td>
              <td>11.2</td>
              <td>87%</td>
            </tr>
            <tr>
              <td>HEFA</td>
              <td>Soybean Oil</td>
              <td>25.6</td>
              <td>71%</td>
            </tr>
            <tr>
              <td>FT-SPK</td>
              <td>Forest Residue</td>
              <td>8.7</td>
              <td>90%</td>
            </tr>
            <tr>
              <td>ATJ</td>
              <td>Corn Starch</td>
              <td>34.9</td>
              <td>61%</td>
            </tr>
          </table>

          <h2>Market Integration Strategy</h2>

          <h3>Customer Segmentation</h3>
          <h4>Airlines</h4>
          <ul>
            <li><strong>Primary Need:</strong> SAF for operational use and CORSIA compliance</li>
            <li><strong>Carbon Credits:</strong> Additional credits for scope 3 emissions</li>
            <li><strong>Pricing Sensitivity:</strong> Moderate, focused on cost-effectiveness</li>
          </ul>

          <h4>Corporate Buyers</h4>
          <ul>
            <li><strong>Primary Need:</strong> Business travel emissions offsetting</li>
            <li><strong>Preference:</strong> High-quality, verified carbon neutrality</li>
            <li><strong>Pricing Sensitivity:</strong> Low, willing to pay premium for quality</li>
          </ul>

          <h3>Platform Features</h3>
          <ul>
            <li><strong>Transparent Pricing:</strong> Separate pricing for SAF and carbon components</li>
            <li><strong>Flexible Bundling:</strong> Options for SAF-only, credits-only, or bundled purchases</li>
            <li><strong>Impact Tracking:</strong> Real-time emissions reduction metrics</li>
            <li><strong>Verification Dashboard:</strong> Access to all certification documents</li>
          </ul>

          <h2>Revenue Optimization</h2>
          <ul>
            <li><strong>Timing:</strong> Market carbon credits when VCM prices are favorable</li>
            <li><strong>Quality Premiums:</strong> Invest in Gold Standard certification for 20-30% premium</li>
            <li><strong>Additionality:</strong> Demonstrate clear additionality for higher credit values</li>
            <li><strong>Co-benefits:</strong> Highlight sustainable development impacts</li>
          </ul>
        `;

      case 'QUALITY_STANDARDS.md':
        return `
          <h1>SAF Quality Standards & Testing Protocols</h1>

          <h2>Executive Summary</h2>
          <p>This document outlines the comprehensive quality standards, testing protocols, and certification processes for sustainable aviation fuel to ensure safety, performance, and regulatory compliance.</p>

          <h2>International Fuel Specifications</h2>

          <h3>ASTM D7566 (Standard Specification for Aviation Turbine Fuel Containing Synthesized Hydrocarbons)</h3>

          <h4>Approved Production Pathways</h4>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Annex</th>
              <th>Pathway</th>
              <th>Max Blend Ratio</th>
              <th>Key Requirements</th>
            </tr>
            <tr>
              <td>A1</td>
              <td>Fischer-Tropsch SPK</td>
              <td>50%</td>
              <td>Aromatics: 8-25%, Density: 0.730-0.770 g/cm³</td>
            </tr>
            <tr>
              <td>A2</td>
              <td>HEFA-SPK</td>
              <td>50%</td>
              <td>Freezing Point: -47°C max, Flash Point: 38°C min</td>
            </tr>
            <tr>
              <td>A3</td>
              <td>SIP (Synthesized Iso-Paraffinic)</td>
              <td>10%</td>
              <td>Specific gravity: 0.730-0.770, Viscosity limits</td>
            </tr>
            <tr>
              <td>A5</td>
              <td>ATJ-SPK (Alcohol-to-Jet)</td>
              <td>30%</td>
              <td>Aromatics: 8-25%, Sulfur: 15 ppm max</td>
            </tr>
            <tr>
              <td>A7</td>
              <td>CHJ (Catalytic Hydrothermolysis Jet)</td>
              <td>50%</td>
              <td>Thermal stability, Metal content limits</td>
            </tr>
          </table>

          <h3>DEF STAN 91-91 (UK Defence Standard)</h3>
          <ul>
            <li><strong>Scope:</strong> Jet fuel for UK military applications</li>
            <li><strong>Additives:</strong> Mandatory thermal stability improver</li>
            <li><strong>Aromatics:</strong> 8-25% by volume requirement</li>
            <li><strong>Lubricity:</strong> Enhanced requirements for military applications</li>
          </ul>

          <h2>Testing Protocols</h2>

          <h3>Physical Properties Testing</h3>

          <h4>Density/Specific Gravity (ASTM D4052)</h4>
          <ul>
            <li><strong>Specification:</strong> 0.775-0.840 g/cm³ at 15°C</li>
            <li><strong>Test Method:</strong> Digital density meter</li>
            <li><strong>Frequency:</strong> Every production batch</li>
            <li><strong>Tolerance:</strong> ±0.001 g/cm³</li>
          </ul>

          <h4>Freezing Point (ASTM D2386)</h4>
          <ul>
            <li><strong>Specification:</strong> -47°C maximum</li>
            <li><strong>Test Method:</strong> Visual observation during controlled cooling</li>
            <li><strong>Critical Parameter:</strong> Ensures fuel flow at altitude</li>
            <li><strong>SAF Challenge:</strong> Some pathways produce high-freezing-point components</li>
          </ul>

          <h4>Flash Point (ASTM D56)</h4>
          <ul>
            <li><strong>Specification:</strong> 38°C minimum</li>
            <li><strong>Safety Requirement:</strong> Prevents ignition during handling</li>
            <li><strong>Test Method:</strong> Tag closed cup apparatus</li>
            <li><strong>Quality Control:</strong> Critical for fuel safety certification</li>
          </ul>

          <h3>Chemical Composition Analysis</h3>

          <h4>Aromatics Content (ASTM D1319)</h4>
          <ul>
            <li><strong>Specification:</strong> 8-25% by volume</li>
            <li><strong>Importance:</strong> Affects seal swelling and thermal stability</li>
            <li><strong>SAF Challenge:</strong> Many SAF pathways produce low aromatics</li>
            <li><strong>Solution:</strong> Blending with aromatic-rich conventional fuel</li>
          </ul>

          <h4>Sulfur Content (ASTM D4294)</h4>
          <ul>
            <li><strong>Specification:</strong> 3000 ppm maximum</li>
            <li><strong>Typical SAF:</strong> <10 ppm (significantly lower than conventional)</li>
            <li><strong>Environmental Benefit:</strong> Reduced sulfur emissions</li>
            <li><strong>Test Method:</strong> X-ray fluorescence spectroscopy</li>
          </ul>

          <h3>Performance Testing</h3>

          <h4>Thermal Stability (ASTM D3241)</h4>
          <ul>
            <li><strong>Test Conditions:</strong> 260°C for 2.5 hours</li>
            <li><strong>Measurements:</strong> Filter pressure drop, tube deposits</li>
            <li><strong>Specification:</strong> <25 mm Hg pressure drop</li>
            <li><strong>Critical For:</strong> High-temperature engine operation</li>
          </ul>

          <h4>Lubricity (ASTM D5001)</h4>
          <ul>
            <li><strong>Specification:</strong> Minimum lubricity requirements</li>
            <li><strong>Test Method:</strong> High-frequency reciprocating rig</li>
            <li><strong>SAF Advantage:</strong> Often superior to conventional jet fuel</li>
            <li><strong>Engine Benefit:</strong> Reduced wear on fuel system components</li>
          </ul>

          <h2>Certification Process</h2>

          <h3>ASTM Ballot Process</h3>
          <ol>
            <li><strong>Research Phase:</strong> 2-5 years of laboratory testing</li>
            <li><strong>OEM Testing:</strong> Engine and component testing by manufacturers</li>
            <li><strong>Flight Testing:</strong> Demonstration flights with various aircraft</li>
            <li><strong>Annex Development:</strong> Detailed specification writing</li>
            <li><strong>Industry Ballot:</strong> ASTM committee voting process</li>
            <li><strong>Approval:</strong> Publication of new annex to ASTM D7566</li>
          </ol>

          <h3>Quality Assurance System</h3>

          <h4>Production Monitoring</h4>
          <ul>
            <li><strong>Real-time Analysis:</strong> Online process analyzers</li>
            <li><strong>Batch Testing:</strong> Complete specification testing per batch</li>
            <li><strong>Statistical Process Control:</strong> Trend analysis and control limits</li>
            <li><strong>Chain of Custody:</strong> Sample tracking from production to delivery</li>
          </ul>

          <h4>Third-Party Verification</h4>
          <ul>
            <li><strong>Independent Labs:</strong> Certified testing facilities</li>
            <li><strong>Round Robin Testing:</strong> Multi-lab verification for critical batches</li>
            <li><strong>Auditing:</strong> Annual quality system audits</li>
            <li><strong>Certification Bodies:</strong> ISCC, RSB, SQF certification</li>
          </ul>

          <h2>Sustainability Quality Metrics</h2>

          <h3>Lifecycle Assessment Requirements</h3>
          <ul>
            <li><strong>GHG Reduction:</strong> Minimum 50% reduction vs conventional fuel</li>
            <li><strong>Land Use Change:</strong> Indirect land use change impact assessment</li>
            <li><strong>Water Impact:</strong> Water consumption and quality impact metrics</li>
            <li><strong>Biodiversity:</strong> Impact on ecosystems and species</li>
          </ul>

          <h3>Social Sustainability</h3>
          <ul>
            <li><strong>Labor Standards:</strong> ILO core conventions compliance</li>
            <li><strong>Community Impact:</strong> Local economic development assessment</li>
            <li><strong>Food Security:</strong> No competition with food production</li>
            <li><strong>Land Rights:</strong> Free, prior, and informed consent procedures</li>
          </ul>

          <h2>Future Developments</h2>
          <ul>
            <li><strong>100% SAF Approval:</strong> Work toward neat SAF usage</li>
            <li><strong>Power-to-Liquids:</strong> New pathways under development</li>
            <li><strong>Advanced Analytics:</strong> Machine learning for quality prediction</li>
            <li><strong>Blockchain Verification:</strong> Immutable quality and sustainability records</li>
          </ul>
        `;

      case 'MARKET_ANALYSIS_COMPETITIVE_POSITIONING.md':
        return `
          <h1>🎯 Market Analysis & Competitive Positioning</h1>

          <h2>Executive Summary</h2>
          <p>The Sustainable Aviation Fuel (SAF) Certificate Broker platform addresses critical gaps in the $15.1 billion SAF market by providing a technology-first, independent brokerage solution for aviation carbon offset compliance. Our platform differentiates through superior user experience, real-time market integration, and comprehensive regulatory compliance automation.</p>

          <h2>🌍 Market Opportunity</h2>

          <h3>Market Size & Growth</h3>
          <ul>
            <li><strong>Global SAF Market:</strong> Projected to reach $15.1 billion by 2030</li>
            <li><strong>CAGR:</strong> 68.9% compound annual growth rate (2023-2030)</li>
            <li><strong>Current Production:</strong> 300 million liters annually (0.1% of jet fuel demand)</li>
            <li><strong>Target by 2030:</strong> 2.3 billion liters annually</li>
          </ul>

          <h3>Regulatory Drivers</h3>
          <ul>
            <li><strong>EU ReFuelEU Aviation:</strong> 2% SAF blend mandate by 2025, 5% by 2030</li>
            <li><strong>CORSIA (ICAO):</strong> Carbon-neutral growth for international aviation</li>
            <li><strong>US Inflation Reduction Act:</strong> $1.75/gallon SAF tax credit</li>
            <li><strong>Net-Zero Commitments:</strong> Airlines committed to 2050 carbon neutrality</li>
          </ul>

          <h2>🏢 Current Market Players</h2>

          <h3>Direct SAF Trading Platforms</h3>

          <h4>1. IATA SAF Registry</h4>
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
            <p><strong>What they do:</strong> Official aviation industry registry for SAF certificates</p>
            <p><strong>Scale:</strong> Global, backed by International Air Transport Association</p>
            <p><strong>Revenue Model:</strong> Registry fees, membership dues</p>
            <p><strong>❌ Gap:</strong> Poor user experience, limited payment integration</p>
            <p><strong>✅ Our Advantage:</strong> Modern UI/UX, integrated Stripe payments</p>
          </div>

          <h4>2. SkyNRG (bp Subsidiary)</h4>
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;">
            <p><strong>What they do:</strong> SAF supply chain management and certificate trading</p>
            <p><strong>Scale:</strong> $100M+ transactions, partnerships with KLM, United Airlines</p>
            <p><strong>Revenue Model:</strong> Supply chain margins, consulting fees</p>
            <p><strong>❌ Gap:</strong> Producer-owned (conflict of interest), enterprise-only</p>
            <p><strong>✅ Our Advantage:</strong> Independent brokerage, consumer + enterprise access</p>
          </div>

          <h4>3. Neste MY Sustainable Aviation Fuel</h4>
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
            <p><strong>What they do:</strong> SAF production and certificate platform</p>
            <p><strong>Scale:</strong> World's largest SAF producer (2M tons annually)</p>
            <p><strong>Revenue Model:</strong> Fuel sales + premium pricing</p>
            <p><strong>❌ Gap:</strong> Single producer, limited certificate trading</p>
            <p><strong>✅ Our Advantage:</strong> Multi-producer marketplace, price transparency</p>
          </div>

          <h3>Carbon Credit Platforms (Adjacent Market)</h3>

          <h4>4. Verra (Verified Carbon Standard)</h4>
          <div style="background: #e8f5e8; padding: 15px; border-left: 4px solid #22c55e; margin: 10px 0;">
            <p><strong>Scale:</strong> 1.8 billion carbon credits issued, $1B+ market</p>
            <p><strong>Learning:</strong> Established registry model, transaction fee structure</p>
            <p><strong>Opportunity:</strong> Aviation-specific specialization gap</p>
          </div>

          <h4>5. Puro.earth</h4>
          <div style="background: #e8f5e8; padding: 15px; border-left: 4px solid #22c55e; margin: 10px 0;">
            <p><strong>Scale:</strong> $10M+ transactions, 500+ corporate buyers</p>
            <p><strong>Revenue Model:</strong> 10-15% transaction fees</p>
            <p><strong>Learning:</strong> Real-time pricing, API integration success</p>
          </div>

          <h4>6. Climate Trade</h4>
          <div style="background: #e8f5e8; padding: 15px; border-left: 4px solid #22c55e; margin: 10px 0;">
            <p><strong>Scale:</strong> $50M+ offset transactions</p>
            <p><strong>Revenue Model:</strong> Transaction fees, API licensing</p>
            <p><strong>Learning:</strong> API-first approach, e-commerce integration</p>
          </div>

          <h3>Aviation Sustainability Platforms</h3>

          <h4>7. 4AIR</h4>
          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #856404; margin: 10px 0;">
            <p><strong>What they do:</strong> Aviation sustainability rating and offset platform</p>
            <p><strong>Scale:</strong> Partnerships with NetJets, Flexjet, major business aviation</p>
            <p><strong>Focus:</strong> Business aviation market, sustainability ratings</p>
            <p><strong>❌ Gap:</strong> Limited commercial aviation, no certificate trading</p>
            <p><strong>✅ Our Advantage:</strong> Full commercial aviation focus, certificate marketplace</p>
          </div>

          <h2>🔍 Competitive Gap Analysis</h2>

          <h3>Technology Gaps</h3>
          <table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr style="background: #f8f9fa;">
              <th>Feature</th>
              <th>IATA Registry</th>
              <th>SkyNRG</th>
              <th>Neste</th>
              <th>Our Platform</th>
            </tr>
            <tr>
              <td>Modern UI/UX</td>
              <td style="background: #ffebee;">❌ Legacy</td>
              <td style="background: #fff3e0;">⚠️ B2B Only</td>
              <td style="background: #fff3e0;">⚠️ Basic</td>
              <td style="background: #e8f5e8;">✅ Angular 20</td>
            </tr>
            <tr>
              <td>Real-time Pricing</td>
              <td style="background: #ffebee;">❌ Static</td>
              <td style="background: #fff3e0;">⚠️ Limited</td>
              <td style="background: #ffebee;">❌ Producer Set</td>
              <td style="background: #e8f5e8;">✅ OPIS/Platts API</td>
            </tr>
            <tr>
              <td>Payment Processing</td>
              <td style="background: #ffebee;">❌ None</td>
              <td style="background: #fff3e0;">⚠️ Manual</td>
              <td style="background: #fff3e0;">⚠️ Basic</td>
              <td style="background: #e8f5e8;">✅ Stripe Integration</td>
            </tr>
            <tr>
              <td>API Integration</td>
              <td style="background: #fff3e0;">⚠️ Limited</td>
              <td style="background: #fff3e0;">⚠️ Enterprise</td>
              <td style="background: #ffebee;">❌ None</td>
              <td style="background: #e8f5e8;">✅ Full REST API</td>
            </tr>
            <tr>
              <td>Mobile Support</td>
              <td style="background: #ffebee;">❌ None</td>
              <td style="background: #ffebee;">❌ Desktop Only</td>
              <td style="background: #fff3e0;">⚠️ Basic</td>
              <td style="background: #e8f5e8;">✅ Responsive</td>
            </tr>
          </table>

          <h3>Market Access Gaps</h3>
          <ul>
            <li><strong>Consumer Market:</strong> No platform serves individual travelers or small businesses</li>
            <li><strong>Price Transparency:</strong> Most platforms use opaque pricing models</li>
            <li><strong>Independent Brokerage:</strong> Most platforms tied to specific producers</li>
            <li><strong>Real-time Processing:</strong> Manual processes dominate current solutions</li>
          </ul>

          <h2>🚀 Our Unique Value Proposition</h2>

          <h3>1. Technology-First Approach</h3>
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>Modern Stack:</strong> Angular 20 + Spring Boot + real-time APIs</p>
            <p><strong>User Experience:</strong> Consumer-grade UX for enterprise transactions</p>
            <p><strong>Performance:</strong> Sub-second quote generation and certificate issuance</p>
          </div>

          <h3>2. Independent Marketplace</h3>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>Multi-Producer:</strong> Not tied to single SAF producer</p>
            <p><strong>Price Competition:</strong> Transparent market-driven pricing</p>
            <p><strong>Consumer Choice:</strong> Multiple SAF types and price points</p>
          </div>

          <h3>3. Complete Automation</h3>
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>End-to-End:</strong> Quote → Payment → Certificate → Compliance</p>
            <p><strong>Real-time:</strong> Instant emissions calculation and pricing</p>
            <p><strong>Compliance Ready:</strong> CORSIA, EU ETS, ICAO standards built-in</p>
          </div>

          <h3>4. Market Accessibility</h3>
          <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>All Market Segments:</strong> Individual, SME, and enterprise customers</p>
            <p><strong>Low Minimums:</strong> $50+ transactions vs. $10K+ minimums elsewhere</p>
            <p><strong>Self-Service:</strong> No sales calls required for standard transactions</p>
          </div>

          <h2>📊 Competitive Positioning Matrix</h2>

          <table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr style="background: #f8f9fa;">
              <th>Competitor</th>
              <th>Strengths</th>
              <th>Weaknesses</th>
              <th>Market Position</th>
              <th>Our Advantage</th>
            </tr>
            <tr>
              <td><strong>IATA Registry</strong></td>
              <td>Official authority, global reach</td>
              <td>Poor UX, no payments, slow</td>
              <td>Regulatory compliance</td>
              <td>Superior technology, better UX</td>
            </tr>
            <tr>
              <td><strong>SkyNRG/bp</strong></td>
              <td>Established relationships, scale</td>
              <td>Producer bias, enterprise-only</td>
              <td>Large airline partnerships</td>
              <td>Independent, consumer access</td>
            </tr>
            <tr>
              <td><strong>Neste</strong></td>
              <td>Production capacity, quality</td>
              <td>Single producer, limited trading</td>
              <td>SAF production leader</td>
              <td>Multi-producer marketplace</td>
            </tr>
            <tr>
              <td><strong>4AIR</strong></td>
              <td>Business aviation focus, ratings</td>
              <td>Limited scope, no trading</td>
              <td>Business aviation sustainability</td>
              <td>Commercial aviation, full trading</td>
            </tr>
          </table>

          <h2>🎯 Market Entry Strategy</h2>

          <h3>Phase 1: Market Validation (Months 1-3)</h3>
          <ul>
            <li><strong>Target:</strong> Small/medium airlines and corporate travel departments</li>
            <li><strong>Value Prop:</strong> Easy compliance with CORSIA requirements</li>
            <li><strong>Revenue Goal:</strong> $100K ARR, 50+ transactions/month</li>
          </ul>

          <h3>Phase 2: Scale & Automation (Months 4-12)</h3>
          <ul>
            <li><strong>Target:</strong> Major airlines, travel management companies</li>
            <li><strong>Value Prop:</strong> Real-time pricing, API integration, bulk processing</li>
            <li><strong>Revenue Goal:</strong> $2.5M ARR, 2,000+ transactions/month</li>
          </ul>

          <h3>Phase 3: Market Leadership (Year 2+)</h3>
          <ul>
            <li><strong>Target:</strong> Global aviation industry, regulatory bodies</li>
            <li><strong>Value Prop:</strong> Industry standard platform, data insights, policy tools</li>
            <li><strong>Revenue Goal:</strong> $25M+ ARR, market leadership position</li>
          </ul>

          <h2>🛡️ Competitive Moats</h2>

          <h3>1. Technology Moat</h3>
          <ul>
            <li><strong>Modern Architecture:</strong> 2+ year lead over legacy systems</li>
            <li><strong>Real-time Integration:</strong> Live market data and emissions calculation</li>
            <li><strong>API-First:</strong> Easy integration for enterprise customers</li>
          </ul>

          <h3>2. Regulatory Expertise</h3>
          <ul>
            <li><strong>Compliance Built-in:</strong> CORSIA, EU ETS, ICAO standards</li>
            <li><strong>Automatic Updates:</strong> Policy changes reflected immediately</li>
            <li><strong>Multi-Jurisdiction:</strong> Global regulatory knowledge</li>
          </ul>

          <h3>3. Network Effects</h3>
          <ul>
            <li><strong>Marketplace:</strong> More buyers attract more sellers</li>
            <li><strong>Data Advantage:</strong> Transaction data improves pricing models</li>
            <li><strong>Integration Network:</strong> Connected systems increase switching costs</li>
          </ul>

          <h3>4. Independent Position</h3>
          <ul>
            <li><strong>No Conflicts:</strong> Not owned by producers or airlines</li>
            <li><strong>Price Discovery:</strong> True market pricing vs. producer markups</li>
            <li><strong>Innovation Freedom:</strong> Not constrained by legacy business models</li>
          </ul>

          <h2>📈 Success Metrics & KPIs</h2>

          <h3>Market Share Indicators</h3>
          <ul>
            <li><strong>Transaction Volume:</strong> Target 5% of EU market by 2027</li>
            <li><strong>Customer Acquisition:</strong> 100+ airlines using platform</li>
            <li><strong>Geographic Expansion:</strong> Active in US, EU, Asia-Pacific</li>
          </ul>

          <h3>Competitive Advantage Metrics</h3>
          <ul>
            <li><strong>Price Discovery:</strong> 15-20% cost savings vs. direct procurement</li>
            <li><strong>Processing Speed:</strong> <2 minutes for certificate issuance</li>
            <li><strong>Customer Satisfaction:</strong> >90% NPS score</li>
          </ul>

          <h2>🔮 Future Market Evolution</h2>

          <h3>Technology Trends</h3>
          <ul>
            <li><strong>Blockchain Integration:</strong> Immutable certificate verification</li>
            <li><strong>AI/ML Optimization:</strong> Predictive pricing and demand forecasting</li>
            <li><strong>IoT Integration:</strong> Real-time fuel usage monitoring</li>
          </ul>

          <h3>Regulatory Evolution</h3>
          <ul>
            <li><strong>Global Harmonization:</strong> Unified international standards</li>
            <li><strong>Mandatory Adoption:</strong> Government mandates for SAF usage</li>
            <li><strong>Carbon Pricing:</strong> Direct carbon tax integration</li>
          </ul>

          <h3>Market Maturation</h3>
          <ul>
            <li><strong>Commoditization:</strong> SAF certificates become standardized commodity</li>
            <li><strong>Financial Products:</strong> Futures, options, and derivatives trading</li>
            <li><strong>Infrastructure Build-out:</strong> Global SAF production capacity</li>
          </ul>

          <h2>💡 Strategic Recommendations</h2>

          <h3>Immediate Actions (Next 6 Months)</h3>
          <ol>
            <li><strong>Deploy to Azure:</strong> Production-grade infrastructure</li>
            <li><strong>Real Market Data:</strong> Integrate OPIS/Platts pricing APIs</li>
            <li><strong>Pilot Partnerships:</strong> 3-5 regional airlines</li>
            <li><strong>Regulatory Certification:</strong> CORSIA compliance validation</li>
          </ol>

          <h3>Medium-term Strategy (6-18 Months)</h3>
          <ol>
            <li><strong>Enterprise Features:</strong> SSO, bulk processing, white-labeling</li>
            <li><strong>Geographic Expansion:</strong> EU and US market entry</li>
            <li><strong>Partnership Network:</strong> Travel agencies, booking platforms</li>
            <li><strong>Blockchain Integration:</strong> Certificate immutability</li>
          </ol>

          <h3>Long-term Vision (2+ Years)</h3>
          <ol>
            <li><strong>Market Leadership:</strong> 20%+ market share in target regions</li>
            <li><strong>Platform Ecosystem:</strong> Third-party integrations and applications</li>
            <li><strong>Policy Influence:</strong> Thought leadership in SAF regulation</li>
            <li><strong>Global Standard:</strong> De facto industry platform</li>
          </ol>

          <h2>🎊 Conclusion</h2>
          <p>The SAF Certificate Broker platform is uniquely positioned to capture significant market share in the rapidly growing $15B+ SAF market. By addressing critical gaps in technology, user experience, and market access left by current players, we can establish a sustainable competitive advantage and build the industry-standard platform for SAF certificate trading.</p>

          <p><strong>Key Success Factors:</strong></p>
          <ul>
            <li>✅ Strong technology foundation with modern architecture</li>
            <li>✅ Independent market position without conflicts of interest</li>
            <li>✅ Comprehensive regulatory compliance built-in</li>
            <li>✅ Clear path to market leadership through superior execution</li>
          </ul>
        `;

      default:
        return `
          <h1>${doc.title}</h1>
          <p>${doc.description}</p>
          <p><em>This document is currently being developed. Please check back soon for complete content.</em></p>
        `;
    }
  }

  closeViewer(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.selectedDocument = null;
    this.documentContent = '';
  }
}
