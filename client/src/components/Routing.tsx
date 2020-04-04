import React from "react"; 
import { Link as RouterLink } from 'react-router-dom';
import { LinkProps, Link } from "@material-ui/core";

export interface LinkRouterProps extends LinkProps {
    to: string;
    replace?: boolean;
}
  
export const LinkRouter = (props: LinkRouterProps) => <Link {...props} component={RouterLink as any} />;
