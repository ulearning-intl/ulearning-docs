const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 导入配置
const config = require('./next.config.js'); // 替换成你配置文件的实际路径

// 读取 i18n 列表
const i18nList = config.i18n.locales;

const createFiles = (fileList, outputDir) => {
  // 检查目录是否存在，如果不存在，则创建它
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  fileList.forEach((fileName) => {
    const filePath = path.join(outputDir, fileName.trim()); // 使用 trim() 移除可能的行尾空格
    fs.writeFile(filePath, '', (err) => {
      if (err) {
        console.error(`Error creating file ${fileName}:`, err);
      } else {
        console.log(`File ${fileName} created successfully in ${outputDir}`);
      }
    });
  });
};

yargs.command({
  command: 'generate',
  describe: 'Generate files from a list',
  builder: {
    file: {
      describe: 'Path to the file containing the list',
      demandOption: true,
      type: 'string',
    },
    output: {
      describe: 'Output directory for the files',
      demandOption: false, // 这个参数不是必需的
      type: 'string',
      default: '.', // 默认值是当前目录
    }
  },
  handler: function(argv) {
    const filePath = argv.file;
    const outputDir = argv.output;

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return;
      }
      const fileList = data.split('\n'); // 假设文件列表是每行一个文件名
      createFiles(fileList, outputDir);
    });
  }
}).argv;

const generateMetaFiles = (locales, outputDir) => {
    // 检查目录是否存在，如果不存在，则创建它
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    }
  
    // 为每个语言环境生成元数据文件
    locales.forEach((locale) => {
      const metaFilePath = path.join(outputDir, `_meta.${locale}.json`);
      fs.writeFile(metaFilePath, '{}', (err) => {
        if (err) {
          console.error(`Error creating meta file for ${locale}:`, err);
        } else {
          console.log(`Meta file for ${locale} created successfully in ${outputDir}`);
        }
      });
    });
  };
  
  // node cli.js generate-meta --folder pages/{sample} 在sample文件夹下，生成_meta.{locale}.json文件
  yargs.command({
    command: 'generate-meta',
    describe: 'Generate meta files for each locale',
    builder: {
      folder: {
        describe: 'Folder to generate meta files in',
        demandOption: true,
        type: 'string',
      }
    },
    handler: function(argv) {
      const outputDir = argv.folder;
      generateMetaFiles(i18nList, outputDir);
    }
  }).argv;

  // 其他代码保持不变...

  const generatePageFiles = (locales, outputDir, fileName) => {
    // 分离文件名和后缀名
    const baseName = path.basename(fileName, path.extname(fileName));
    const ext = path.extname(fileName);
  
    // 检查目录是否存在，如果不存在，则创建它
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    }
  
    // 为每个语言环境生成页面文件
    locales.forEach((locale) => {
      const localizedfileName = `${baseName}.${locale}${ext}`;
      const pageFilePath = path.join(outputDir, localizedfileName);
      fs.writeFile(pageFilePath, '', (err) => {
        if (err) {
          console.error(`Error creating page file for ${locale}:`, err);
        } else {
          console.log(`Page file for ${locale} created successfully in ${outputDir}`);
        }
      });
    });
  };
  
  
  // node cli.js generate-locales --folder pages/{sample} --filename _meta.json 在page/sample文件夹下，按照locales列表，生成_meta.{locale}.json文件
  yargs.command({
    command: 'generate-locales',
    describe: 'Generate page files for each locale',
    builder: {
      folder: {
        describe: 'Folder to generate page files in',
        demandOption: true,
        type: 'string',
      },
      filename: {
        describe: 'Base name of the page file',
        demandOption: true,
        type: 'string',
      }
    },
    handler: function(argv) {
      const outputDir = argv.folder;
      const fileName = argv.filename;
      generatePageFiles(i18nList, outputDir, fileName);
    }
  }).argv;
  

// 其他代码保持不变...
const confirmAndDeleteFiles = async (fileList) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    console.log('The following files will be deleted:');
    fileList.forEach(file => console.log(file));
    
    rl.question('Are you sure you want to delete these files? (yes/no) ', async (answer) => {
      const normalizedAnswer = answer.toLowerCase().trim();
      if (normalizedAnswer === 'yes' || normalizedAnswer === 'y') {
        // 创建一个 promises 数组来存储所有删除操作的 Promise
        const deletePromises = fileList.map(file => {
          return new Promise((resolve, reject) => {
            fs.unlink(file, (err) => {
              if (err) {
                console.error(`Error deleting file ${file}:`, err);
                reject(err);
              } else {
                console.log(`Deleted file ${file}`);
                resolve();
              }
            });
          });
        });
  
        // 等待所有的删除操作完成
        try {
          await Promise.all(deletePromises);
          console.log('All files have been deleted successfully.');
        } catch (error) {
          console.error('An error occurred while deleting files.');
        }
      } else if (normalizedAnswer === 'no' || normalizedAnswer === 'n') {
        console.log('Deletion cancelled.');
      } else {
        console.log('Invalid response. Please type "yes" (or "y") or "no" (or "n").');
      }
  
      rl.close();
    });
  };
  
const findLocaleFiles = (outputDir, baseFileName) => {
    const baseFileNameWithoutExt = path.basename(baseFileName, path.extname(baseFileName));
    
    return fs.readdirSync(outputDir)
      .filter(file => {
        const nameWithoutExt = path.basename(file, path.extname(file));
        return i18nList.some(locale => nameWithoutExt === `${baseFileNameWithoutExt}.${locale}`);
      })
      .map(file => path.join(outputDir, file));
  };



// node cli.js delete-locales --folder pages/{sample} --filename _meta  删除所有page/sample文件夹下，_meta开头的locales
yargs.command({
  command: 'delete-locales',
  describe: 'Delete locale-specific files for a given base file name',
  builder: {
    folder: {
      describe: 'Folder containing the files to be deleted',
      demandOption: true,
      type: 'string',
    },
    filename: {
      describe: 'Base name of the files to be deleted',
      demandOption: true,
      type: 'string',
    }
  },
  handler: function(argv) {
    const outputDir = argv.folder;
    const baseFileName = argv.filename;
    const fileList = findLocaleFiles(outputDir, baseFileName);

    if (fileList.length === 0) {
      console.log('No matching files found.');
      return;
    }

    confirmAndDeleteFiles(fileList);
  }
}).argv;


//更新meta列表
const extractPageNames = (outputDir) => {
    const pageNames = {};
    fs.readdirSync(outputDir)
      .filter(file => !file.startsWith('_') && file.endsWith('.mdx'))
      .forEach(file => {
        const baseName = file.split('.')[0];
        pageNames[baseName] = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      });
    return pageNames;
  };
  
  const updateMetaFiles = (outputDir, pageNames, rebuild = false) => {

    console.log(`Rebuild option is set to: ${rebuild}`);  // 调试信息

    fs.readdirSync(outputDir)
      .filter(file => file.startsWith('_meta.') && file.endsWith('.json'))
      .forEach(metaFile => {
        const metaFilePath = path.join(outputDir, metaFile);
        let metaData = rebuild ? {} : {};
  
        if (!rebuild) {
          try {
            const fileContent = fs.readFileSync(metaFilePath, 'utf-8');
            metaData = fileContent ? JSON.parse(fileContent) : {};
          } catch (err) {
            console.error(`Error reading or parsing ${metaFile}:`, err);
            return;
          }
        }
  

        // 更新元数据对象
        // 更新元数据对象
        for (const key in pageNames) {
            if (rebuild || !metaData.hasOwnProperty(key)) {  // 重建模式或键不存在时添加
            metaData[key] = pageNames[key];
            }
        }

  
        fs.writeFileSync(metaFilePath, JSON.stringify(metaData, null, 2));
      });
  };
  
  const confirmAndUpdateMeta = (outputDir, pageNames, rebuild) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    console.log('The following page names will be added/updated:');
    Object.keys(pageNames).forEach(key => {
      console.log(`"${key}": "${pageNames[key]}"`);
    });
  
    rl.question('Are you sure you want to update meta files? (yes/no) ', (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        updateMetaFiles(outputDir, pageNames, rebuild);
        console.log('Meta files updated successfully.');
      } else {
        console.log('Update cancelled.');
      }
      rl.close();
    });
  };
  
  
  // 依据文件夹中内容更新_meta.{locale}.json中的键值
  // node cli.js update-meta --folder pages/utest  #仅将文件夹中新增的文件增加到_meta.{locale}.json中 
  // node cli.js update-meta --folder pages/utest --rebuild # 注意，会覆盖当前的json配置，将键值重置为页面名称
  yargs.command({
    command: 'update-meta',
    describe: 'Update meta files with page names',
    builder: {
      folder: {
        describe: 'Folder containing the pages and meta files',
        demandOption: true,
        type: 'string',
      },
      rebuild: {
        describe: 'Rebuild meta files instead of updating',
        demandOption: false,
        type: 'boolean',
        default: false,
      }
    },
    handler: function(argv) {
      const outputDir = argv.folder;
      const rebuild = argv.rebuild;
      const pageNames = extractPageNames(outputDir);

      if (Object.keys(pageNames).length === 0) {
        console.log('No page files found for updating.');
        return;
      }
      confirmAndUpdateMeta(outputDir, pageNames, rebuild);
    }
  }).argv;