import * as ts from 'typescript';

const program = ts.createProgram(['app/(auth)/sign-up.tsx'], {
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    strict: true,
});

const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile('app/(auth)/sign-up.tsx');

function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && node.expression.getText() === 'useSignUp') {
        const type = checker.getReturnTypeOfSignature(checker.getResolvedSignature(node)!);
        const signUpProp = type.getProperty('signUp');
        if (signUpProp) {
            const signUpType = checker.getTypeOfSymbolAtLocation(signUpProp, node);

            // Let's print out what methods exist on 'password' because signUp.password is used
            const passwordProp = signUpType.getProperty('password');
            if (passwordProp) {
                console.log("password properties:");
                checker.getTypeOfSymbolAtLocation(passwordProp, node).getProperties().forEach(p => console.log(p.getName()));
            }

            const verificationsProp = signUpType.getProperty('verifications');
            if (verificationsProp) {
                console.log("verifications properties:");
                checker.getTypeOfSymbolAtLocation(verificationsProp, node).getProperties().forEach(p => console.log(p.getName()));
            }
        }
    }
    ts.forEachChild(node, visit);
}

if (sourceFile) visit(sourceFile);
