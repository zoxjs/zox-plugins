import {Constructor, PluginDefinition, PluginSetup} from "../../index";
import {PluginDiscovery} from "../../index";

const pluginKey = Symbol('my_plugin');

export interface IMyPlugin
{
    prop: string;
}

export type MyPluginInfo = {
    plugin: IMyPlugin
    data: string
}

export class MyPluginManager
{
    private readonly pluginDefinitions: Array<PluginDefinition<Constructor<IMyPlugin>, string>>;

    constructor(pluginDiscovery: PluginDiscovery)
    {
        this.pluginDefinitions = pluginDiscovery.getPlugins(pluginKey);
    }

    public getAllPlugins(): Array<MyPluginInfo>
    {
        const plugins: Array<MyPluginInfo> = [];
        for (const pluginDefinition of this.pluginDefinitions)
        {
            plugins.push({
                plugin: new pluginDefinition.pluginClass(),
                data: pluginDefinition.data,
            });
        }
        return plugins;
    }
}

export function MyPlugin(data: string)
{
    return PluginSetup<IMyPlugin, string>(pluginKey, data);
}
