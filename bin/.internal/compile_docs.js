const fs = require('fs-extra');
const path = require('path');
const cc = require('change-case');
const yaml = require('js-yaml');
const parser = require('./lib/doc_parser_docs');

const compileApiDocs = () => {
  const servicesDir = path.join(__dirname, '../../src/services');
  const docsDir = path.join(__dirname, '../../docs/api');

  const spec = parser(servicesDir);
  if (spec.error) {
    throw new Error(spec.error);
  }
  fs.mkdirpSync(path.join(__dirname, '../../tmp/.compile'));
  fs.writeFileSync(
    path.join(__dirname, '../../tmp/.compile/spec.docs.json'),
    JSON.stringify(spec, 0, 2),
    'utf-8'
  );

  const modules = spec.modules.map(mod => ({
    name: getName(mod),
    file: `api/${cc.snakeCase(removeHash(mod.name))}.md`,
  }));

  let others = '';
  const outerSidebar = path.join(docsDir, '../_sidebar.md');
  if (fs.existsSync(outerSidebar)) {
    others = fs
      .readFileSync(path.join(docsDir, '../_sidebar.md'), 'utf-8')
      .split('\n')
      .filter(line => {
        if (/\(api\/_index\.md\)/.test(line)) {
          return false;
        }
        return true;
      })
      .join('\n');
  }

  const menu = modules.map(mod => `- [${mod.name}](${mod.file})\n`).join('');
  if (others) {
    const sidebar = `${others}\n- [API文档](api/_index.md)\n${menu}`;
    fs.writeFileSync(path.join(docsDir, '_sidebar.md'), sidebar, 'utf-8');
  } else {
    const sidebar = `- [API文档](api/_index.md)\n${menu}`;
    fs.writeFileSync(path.join(docsDir, '_sidebar.md'), sidebar, 'utf-8');
  }
  const index = `# API文档\n\n${menu}`;
  fs.writeFileSync(path.join(docsDir, '_index.md'), index, 'utf-8');

  for (const mod of spec.modules) {
    const file = `${cc.snakeCase(removeHash(mod.name))}.md`;
    const header = [];
    header.push(`# ${getName(mod)}\n`);
    if (mod.description) {
      header.push(mod.description);
    }

    const actions = [];
    for (const act of mod.actions) {
      const lines = [];
      lines.push(`## ${getName(act)}\n`);
      lines.push('```http');
      lines.push(`${act.route.method} ${act.route.path}`);
      if (act.alternativeRoutes && act.alternativeRoutes.length > 0) {
        for (const route of act.alternativeRoutes) {
          lines.push(`\n${route.method} ${route.path}`);
        }
      }
      lines.push('```');
      lines.push('\n');
      if (act.description) {
        lines.push(act.description);
      }
      lines.push('\n');
      for (const note of act.notes) {
        lines.push(
          `**NOTE**: ${note}`
            .split('\n')
            .map(l => '> ' + l)
            .join('\n')
        );
        lines.push('\n\n');
      }
      const params = act.params.filter(p => p.name);
      if (params.length > 0) {
        lines.push('\n**参数：**\n');
        for (const param of params) {
          if (param.description) {
            lines.push(`- **${param.name}**: *${param.type}* - ${param.description}`);
          } else {
            lines.push(`- **${param.name}**: *${param.type}*`);
          }
        }
        lines.push('\n\n');
      }
      actions.push(lines.join('\n'));
    }
    const content = `${header.join('\n')}\n${actions.join('\n')}\n`;
    fs.writeFileSync(path.join(docsDir, file), content, 'utf-8');
  }
};

// const compileSocketDocs = () => {
//   const docsPath = path.join(__dirname, '../../src/socket/app.socket.docs.yaml');
//   const docs = yaml.safeLoad(fs.readFileSync(docsPath, 'utf-8'));
//   const targetPath = path.join(__dirname, '../../docs/socket.io.md');
//   const lines = [];
//   lines.push('# Socket.io文档');
//   lines.push('');

//   const writeEvents = (events, prefix) => {
//     for (const event of Object.keys(events)) {
//       const { name, desc, data } = events[event];
//       lines.push(`\n## ${prefix}：${name} <small><em>(${event})</em></small>\n`);
//       if (desc) {
//         lines.push(desc);
//         lines.push('');
//       }
//       lines.push(`事件名：\`${event}\`\n`);
//       if (data && Object.keys(data).length > 0) {
//         lines.push('数据：');
//         for (const key of Object.keys(data)) {
//           const value = data[key];
//           if (typeof value === 'object') {
//             const type = Array.isArray(value) ? 'array' : 'object';
//             lines.push('- <details>');
//             lines.push('  <summary>\n');
//             lines.push(`  **${key}**: *${type}*`);
//             lines.push('\n  </summary>\n');
//             const schema = Array.isArray(value) ? value[0] : value;
//             const json = JSON.stringify(schema, 0, 2);
//             lines.push(
//               `\`\`\`json\n${json}\n\`\`\`\n`
//                 .split('\n')
//                 .map(l => `  ${l}`)
//                 .join('\n')
//             );
//             lines.push('\n  </details>');
//           } else {
//             const [, type, comment] = String(value).match(/^(.+?)(?:\s+-\s+(.+))?$/);
//             if (comment && comment.trim()) {
//               lines.push(`- **${key}**: *${type}* - ${comment}`);
//             } else {
//               lines.push(`- **${key}**: *${type}*`);
//             }
//           }
//         }
//       } else {
//         lines.push('数据：\n- 无');
//       }
//       lines.push('');
//     }
//   };

//   if (docs.receive) {
//     writeEvents(docs.receive, '接收');
//   }
//   if (docs.send) {
//     writeEvents(docs.send, '发送');
//   }
//   const content = lines.join('\n') + '\n';
//   fs.writeFileSync(targetPath, content, 'utf-8');
// };

module.exports = () => {
  compileApiDocs();
  // compileSocketDocs();
};

if (require.main === module) {
  module.exports();
}

function removeHash(str) {
  return str.replace(/-[A-Fa-f0-9]{6}(?:-\d+)?$/, '');
}
function getName(obj) {
  const title = obj.title;
  const name = cc.camelCase(removeHash(obj.name));
  return title ? `${title} (${name})` : `${name}`;
}
