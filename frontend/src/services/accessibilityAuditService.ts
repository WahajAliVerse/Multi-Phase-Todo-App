import { A11yAuditReport, AuditRule } from './types';

/**
 * Accessibility audit service for the todo application
 */
export class AccessibilityAuditService {
  /**
   * Performs an accessibility audit on the provided HTML content
   * @param htmlContent The HTML content to audit
   * @returns Audit report with issues found
   */
  static async audit(htmlContent: string): Promise<A11yAuditReport> {
    // In a real implementation, this would use a library like axe-core
    // For this example, we'll simulate the audit process
    
    // Parse the HTML content to find potential issues
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const issues: AuditRule[] = [];
    
    // Check for missing alt attributes on images
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          id: 'image-alt-missing',
          description: 'Image is missing alt attribute',
          elements: [img.outerHTML],
          severity: 'critical',
          helpUrl: 'https://www.w3.org/WAI/tutorials/images/'
        });
      }
    });
    
    // Check for missing labels on form inputs
    const inputs = doc.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      if (id) {
        const label = doc.querySelector(`label[for="${id}"]`);
        if (!label) {
          // Also check if the input is wrapped in a label
          let hasLabel = false;
          let parent = input.parentElement;
          while (parent && parent.tagName !== 'BODY') {
            if (parent.tagName === 'LABEL') {
              hasLabel = true;
              break;
            }
            parent = parent.parentElement;
          }
          
          if (!hasLabel) {
            issues.push({
              id: 'form-element-label-missing',
              description: `Form element with id "${id}" is missing a label`,
              elements: [input.outerHTML],
              severity: 'critical',
              helpUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/'
            });
          }
        }
      }
    });
    
    // Check for sufficient color contrast
    // This is a simplified check - a real implementation would calculate actual contrast ratios
    const elementsWithColor = doc.querySelectorAll('*[style*="color"], *[style*="background"]');
    elementsWithColor.forEach(el => {
      // In a real implementation, we would calculate the contrast ratio
      // For now, we'll just note that these elements should be checked
      const style = el.getAttribute('style');
      if (style && (style.includes('color:') || style.includes('background'))) {
        // Add a notice to manually check contrast
        issues.push({
          id: 'color-contrast-check-needed',
          description: `Element may have insufficient color contrast: ${el.tagName.toLowerCase()} with style "${style}"`,
          elements: [el.outerHTML],
          severity: 'moderate',
          helpUrl: 'https://webaim.org/articles/contrast/'
        });
      }
    });
    
    // Check for valid heading hierarchy
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push({
          id: 'heading-hierarchy-violation',
          description: `Heading level skipped from H${lastLevel} to H${level}`,
          elements: [heading.outerHTML],
          severity: 'moderate',
          helpUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/'
        });
      }
      lastLevel = level;
    });
    
    // Check for focusable elements with no keyboard access
    const focusableElements = doc.querySelectorAll('a[href], button, input, select, textarea, [tabindex]');
    focusableElements.forEach(el => {
      const tabIndex = el.getAttribute('tabindex');
      if (tabIndex === '-1') {
        // Element is focusable via JS but not keyboard navigable
        // This is not necessarily an issue if it's intentional
        // For this example, we'll note it as informational
        issues.push({
          id: 'element-not-keyboard-focusable',
          description: `Element has tabindex="-1" and is not keyboard focusable: ${el.tagName.toLowerCase()}`,
          elements: [el.outerHTML],
          severity: 'moderate',
          helpUrl: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-focus-order.html'
        });
      }
    });
    
    // Check for ARIA attributes
    const ariaElements = doc.querySelectorAll('[role], [aria-*]');
    ariaElements.forEach(el => {
      // Check for common ARIA mistakes
      const role = el.getAttribute('role');
      if (role === 'presentation' && el.querySelector('a, button, input, textarea, select, [tabindex]')) {
        issues.push({
          id: 'presentation-role-with-focusable-content',
          description: 'Element with role="presentation" contains focusable elements',
          elements: [el.outerHTML],
          severity: 'critical',
          helpUrl: 'https://www.w3.org/TR/wai-aria-1.1/#presentation'
        });
      }
    });
    
    return {
      timestamp: new Date().toISOString(),
      url: 'simulated-audit',
      pageContent: htmlContent.substring(0, 100) + '...',
      violations: issues.filter(issue => issue.severity === 'critical'),
      incomplete: issues.filter(issue => issue.severity === 'moderate'),
      passes: [], // In a real implementation, we would track passing elements
      inapplicable: [], // Elements that don't apply to certain rules
      score: 100 - (issues.length * 10) // Simplified scoring
    };
  }
  
  /**
   * Generates an accessibility report in HTML format
   * @param report The audit report to format
   * @returns HTML string for the accessibility report
   */
  static generateHtmlReport(report: A11yAuditReport): string {
    let html = `
      <html>
        <head>
          <title>Accessibility Audit Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .report-header { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-card { text-align: center; padding: 10px; border-radius: 5px; color: white; }
            .critical { background-color: #d32f2f; }
            .moderate { background-color: #f57c00; }
            .minor { background-color: #ffca28; color: black; }
            .issue { border: 1px solid #ddd; margin: 10px 0; padding: 10px; border-radius: 5px; }
            .issue-header { font-weight: bold; margin-bottom: 5px; }
            .issue-content { margin-left: 15px; }
            .element { background-color: #f9f9f9; padding: 5px; border-radius: 3px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>Accessibility Audit Report</h1>
            <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Score: ${report.score}/100</p>
          </div>
          
          <div class="summary">
            <div class="summary-card critical">
              <div>${report.violations.length}</div>
              <div>Critical Issues</div>
            </div>
            <div class="summary-card moderate">
              <div>${report.incomplete.length}</div>
              <div>Moderate Issues</div>
            </div>
          </div>
    `;
    
    if (report.violations.length > 0) {
      html += `
        <h2>Critical Issues</h2>
      `;
      report.violations.forEach(issue => {
        html += `
          <div class="issue">
            <div class="issue-header">${issue.description}</div>
            <div class="issue-content">
              Affected elements:<br>
        `;
        issue.elements.forEach(element => {
          html += `<div class="element">${element}</div>`;
        });
        html += `
              <a href="${issue.helpUrl}" target="_blank">Learn more</a>
            </div>
          </div>
        `;
      });
    }
    
    if (report.incomplete.length > 0) {
      html += `
        <h2>Moderate Issues</h2>
      `;
      report.incomplete.forEach(issue => {
        html += `
          <div class="issue">
            <div class="issue-header">${issue.description}</div>
            <div class="issue-content">
              Affected elements:<br>
        `;
        issue.elements.forEach(element => {
          html += `<div class="element">${element}</div>`;
        });
        html += `
              <a href="${issue.helpUrl}" target="_blank">Learn more</a>
            </div>
          </div>
        `;
      });
    }
    
    if (report.passes.length > 0) {
      html += `
        <h2>Passed Checks</h2>
        <ul>
      `;
      report.passes.forEach(pass => {
        html += `<li>${pass.description}</li>`;
      });
      html += `</ul>`;
    }
    
    html += `
        </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Fixes common accessibility issues in the provided HTML content
   * @param htmlContent The HTML content to fix
   * @returns Fixed HTML content
   */
  static fixCommonIssues(htmlContent: string): string {
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Fix missing alt attributes on images
    const images = doc.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      img.setAttribute('alt', ''); // Empty alt for decorative images, or derive from filename
    });
    
    // Fix missing labels on form inputs
    const inputs = doc.querySelectorAll('input:not([type="hidden"]), textarea, select');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      if (id) {
        const label = doc.querySelector(`label[for="${id}"]`);
        if (!label) {
          // Check if input is inside a label
          let hasLabel = false;
          let parent = input.parentElement;
          while (parent && parent.tagName !== 'BODY') {
            if (parent.tagName === 'LABEL') {
              hasLabel = true;
              break;
            }
            parent = parent.parentElement;
          }
          
          if (!hasLabel) {
            // Create a label for the input
            const labelEl = doc.createElement('label');
            labelEl.setAttribute('for', id);
            labelEl.textContent = `Label for ${input.tagName.toLowerCase()} with id ${id}`;
            
            // Insert the label before the input
            if (input.parentElement) {
              input.parentElement.insertBefore(labelEl, input);
            }
          }
        }
      }
    });
    
    // Serialize the fixed document back to HTML
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }
}