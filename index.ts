import * as fs from "fs";
import * as path from "path";
import * as util from "util";

const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
const readFileAsync = util.promisify(fs.readFile);

const pluginsKey: symbol = Symbol('plugins');

export type PluginDefinition<TPlugin = any, TData = any> = {
    pluginClass: TPlugin
    data: TData
}

export type Constructor<T> = { new (...args): T }

export interface IPluginSource
{
    getPlugins(pluginName: symbol): Array<PluginDefinition>;
}

export interface IPluginDiscovery extends IPluginSource
{
    add(pluginKey: symbol, plugin: any, data: any): void;
    scan(obj: any): void;
    scanModule(moduleExports: any): void;
    scanDirectory(directory: string): Promise<void>;
    scanProject(directory: string): Promise<void>;
    scanNodeModules(directory: string): Promise<void>;
    clear(): void;
}

export class PluginDiscovery implements IPluginDiscovery
{
    private plugins: { [pluginKey:string]: Array<PluginDefinition> } = {};

    public add(pluginKey: symbol, plugin: any, data?: any): void
    {
        if (!this.plugins.hasOwnProperty(pluginKey))
        {
            this.plugins[pluginKey as any] = [];
        }
        this.plugins[pluginKey as any].push({
            pluginClass: plugin,
            data: data,
        });
    }

    public scan(obj: any): void
    {
        if (obj.hasOwnProperty(pluginsKey))
        {
            const pluginKeys = Object.getOwnPropertySymbols(obj[pluginsKey]);
            for (const pluginKey of pluginKeys)
            {
                if (!this.plugins.hasOwnProperty(pluginKey))
                {
                    this.plugins[pluginKey as any] = [];
                }
                for (const pluginData of obj[pluginsKey][pluginKey])
                {
                    this.plugins[pluginKey as any].push({
                        pluginClass: obj,
                        data: pluginData,
                    });
                }
            }
        }
    }

    public scanModule(moduleExports: any): void
    {
        const keys = Object.getOwnPropertyNames(moduleExports);
        for (const key of keys)
        {
            const item = moduleExports[key];
            if (typeof item === 'function' &&
                typeof item.hasOwnProperty === 'function')
            {
                this.scan(item);
            }
        }
    }

    public async scanDirectory(directory: string): Promise<void>
    {
        const moduleList = await listFilesAsync(directory);
        for (const modulePath of moduleList)
        {
            if (modulePath.endsWith('.js') ||
                modulePath.endsWith('.jsx') ||
                (
                    modulePath.endsWith('.ts') &&
                    !modulePath.endsWith('.d.ts') &&
                    !moduleList.includes(modulePath.substr(0,modulePath.length - 3) + '.js')
                ) ||
                (
                    modulePath.endsWith('.tsx') &&
                    !moduleList.includes(modulePath.substr(0,modulePath.length - 4) + '.js')
                )
            )
            {
                const modulePathAbs = path.resolve(modulePath);
                try
                {
                    this.scanModule(require(modulePathAbs));
                }
                catch(e)
                {
                    console.error('Failed to load module:', modulePathAbs, '\n', e);
                }
            }
        }
    }

    public async scanProject(directory: string = ''): Promise<void>
    {
        try
        {
            const packageJson = await readFileAsync(path.join(directory, 'package.json'), 'utf8');
            const packageInfo = JSON.parse(packageJson);
            if (packageInfo.plugins)
            {
                if (packageInfo.plugins.dirs)
                {
                    for (const dir of packageInfo.plugins.dirs)
                    {
                        try
                        {
                            await this.scanDirectory(path.join(directory, dir));
                        }
                        catch(e){}
                    }
                }
                if (packageInfo.plugins.files)
                {
                    for (const file of packageInfo.plugins.files)
                    {
                        try
                        {
                            const modulePathAbs = path.resolve(path.join(directory, file));
                            try
                            {
                                this.scanModule(require(modulePathAbs));
                            }
                            catch(e)
                            {
                                console.error('Failed to load module:', modulePathAbs, '\n', e);
                            }
                        }
                        catch(e){}
                    }
                }
            }
        }
        catch(e)
        {
            try
            {
                await this.scanDirectory(path.join(directory, 'Plugins'));
            }
            catch(e){}
        }
    }

    public async scanNodeModules(directory: string = ''): Promise<void>
    {
        const modulesPath = path.join(directory, 'node_modules');
        try
        {
            const dirs = await readdirAsync(modulesPath);
            for (const dir of dirs)
            {
                if (dir[0] !== '.')
                {
                    if (dir[0] !== '@')
                    {
                        await this.scanProject(path.join('node_modules', dir));
                    }
                    else
                    {
                        const namespacePath = path.join(modulesPath, dir);
                        try
                        {
                            const dirs = await readdirAsync(namespacePath);
                            for (const dir of dirs)
                            {
                                await this.scanProject(path.join('node_modules', dir));
                            }
                        }
                        catch(e){}
                    }
                }
            }
        }
        catch(e){}
    }

    public getPlugins(pluginKey: symbol): Array<PluginDefinition>
    {
        return this.plugins.hasOwnProperty(pluginKey) ? this.plugins[pluginKey as any] : [];
    }

    public clear(): void
    {
        this.plugins = {};
    }
}

export async function listFilesAsync(directory: string): Promise<Array<string>>
{
    let files: Array<string> = [];
    const fileList: Array<string> = await readdirAsync(directory);
    for (let i = 0; i < fileList.length; ++i)
    {
        const file = path.join(directory, fileList[i]);
        const stat: fs.Stats = await statAsync(file);
        if (stat.isDirectory())
        {
            files = files.concat(await listFilesAsync(file));
        }
        else if (stat.isFile())
        {
            files.push(file);
        }
    }
    return files;
}

export function PluginSetup<T = any, U = any>(pluginKey: symbol, data?: U): (pluginClass: Constructor<T>) => void
{
    return function(pluginClass)
    {
        if (!pluginClass.hasOwnProperty(pluginsKey))
        {
            pluginClass[pluginsKey] = {};
        }
        if (!pluginClass[pluginsKey][pluginKey])
        {
            pluginClass[pluginsKey][pluginKey] = [];
        }
        pluginClass[pluginsKey][pluginKey].push(data);
    }
}
