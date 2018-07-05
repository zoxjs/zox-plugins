import {IMyPlugin, MyPlugin} from "../PluginManagers/MyPluginManager";

@MyPlugin('my plugin')
export class MyExample implements IMyPlugin
{
    public prop: string = '1';
    public ex: string = 'a';
}

@MyPlugin('the plug')
export class TheExample extends MyExample
{
    public prop: string = '2';
}
