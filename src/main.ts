import * as core from '@actions/core';
import { getSharedState, InfrastructureServicesSchema, RemoteStateAccessConfigSchema } from '@sovarto/cdktf-state';
import { execSync } from 'child_process';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    try {
        const remoteStateAccessToken = core.getInput('remote-state-access-token', { required: true });
        const remoteStateAccessConfig = RemoteStateAccessConfigSchema.parse(
            JSON.parse(Buffer.from(remoteStateAccessToken, 'base64').toString()));

        const infrastructureServicesState = await getSharedState(remoteStateAccessConfig,
            'infrastructure-services',
            InfrastructureServicesSchema);
        const registry = infrastructureServicesState.containerRegistry;
        execSync(`docker login ${registry.externalAddress} -u ${registry.username} -p ${registry.password}`)
        core.setOutput('container-registry', registry.externalAddress);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed(`Unknown error of type '${ typeof error }${ typeof error === 'object'
                                                                       ? ` / ${ error!.constructor.name }`
                                                                       : '' }' occurred:\n\n${ error }`);
        }
    }
}
